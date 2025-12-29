import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';
import { z } from 'zod';

interface Env {
  CLIENT_AGENT: DurableObjectNamespace;
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  MEDIA_BUCKET: R2Bucket;
}

// Constants
const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024; // 10MB (~60 seconds at 128kbps)
const SUPPORTED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/m4a',
  'audio/mp4',
] as const;

interface CalibrationParams {
  clientId: string;
  contentType: 'posts' | 'articles' | 'transcripts' | 'voice' | 'pdf';
  content?: string[];
  r2Key?: string;
  audioR2Key?: string; // Legacy field for voice
}

// Story 9.8: Define Zod schemas for AI response validation
const BannedWordSchema = z.object({
  word: z.string(),
  severity: z.enum(['hard', 'soft']),
  reason: z.string(),
});

const StanceSchema = z.object({
  topic: z.string(),
  position: z.string(),
});

const ExtractedEntitiesSchema = z.object({
  voiceMarkers: z.array(z.string()).default([]),
  bannedWords: z.array(BannedWordSchema).default([]),
  stances: z.array(StanceSchema).default([]),
  signaturePatterns: z.array(z.string()).default([]),
  toneProfile: z.record(z.string(), z.number()).default({
    formal_casual: 50,
    serious_playful: 50,
    technical_accessible: 50,
    reserved_expressive: 50,
  }),
});

type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;

export class CalibrationWorkflow extends WorkflowEntrypoint<Env, CalibrationParams> {
  async run(event: WorkflowEvent<CalibrationParams>, step: WorkflowStep) {
    const { clientId, contentType, content, r2Key, audioR2Key } = event.payload;

    // Step 1: Get current Brand DNA for comparison
    const currentDNA = await step.do('get-current-dna', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      const response = await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'getBrandDNA',
          params: {},
        }),
      }));

      return response.json();
    });

    // Step 2: Process content based on type
    let processedContent: string = '';

    if (contentType === 'voice' && (audioR2Key || r2Key)) {
      // Voice-to-Grounding Pipeline: Transcribe audio via Workers AI Whisper
      const audioKey = audioR2Key || r2Key;
      processedContent = await step.do('transcribe-voice', async () => {
        // Fetch audio file from R2
        const audioObject = await this.env.MEDIA_BUCKET.get(audioKey!);
        if (!audioObject) {
          throw new Error(`Audio file not found in R2: ${audioKey}`);
        }

        // Validate audio file size
        if (audioObject.size > MAX_AUDIO_FILE_SIZE) {
          throw new Error('Audio file too large. Maximum supported size is 10MB (~60 seconds).');
        }

        // Validate audio format (AC3: user-friendly error for unsupported formats)
        const contentType = audioObject.httpMetadata?.contentType;
        if (contentType && !SUPPORTED_AUDIO_TYPES.includes(contentType as typeof SUPPORTED_AUDIO_TYPES[number])) {
          throw new Error(
            `Unsupported audio format: ${contentType}. Supported formats: MP3, WAV, WebM, OGG, FLAC, M4A.`
          );
        }

        // Convert to ArrayBuffer for Whisper
        const audioData = await audioObject.arrayBuffer();

        // Call Workers AI Whisper model
        // optimization: pass Uint8Array directly to avoid memory spike from spreading into number[]
        const whisperResult = await this.env.AI.run('@cf/openai/whisper', {
          audio: new Uint8Array(audioData) as any,
        });

        const transcript = (whisperResult as { text?: string })?.text || '';
        if (!transcript || transcript.trim().length === 0) {
          throw new Error('Whisper returned empty transcription. Audio may be silent or corrupted.');
        }

        return transcript;
      });
    } else if (contentType === 'pdf' && r2Key) {
      // PDF Extraction Step
      processedContent = await step.do('extract-pdf', async () => {
        // TODO: Implement actual PDF extraction using Workers AI or a library
        // For now, we'll use a placeholder or the provided content if any
        return (content && content[0]) || 'Extracted PDF content placeholder';
      });
    } else if (content && content.length > 0) {
      // Combine all content for analysis
      processedContent = content.join('\n\n---\n\n');
    }

    // Step 3: Extract voice markers and patterns
    const extracted = await step.do('extract-entities', async () => {
      const extractionPrompt = `You are a brand voice analyst. Analyze the following ${contentType} content and extract the author's distinctive voice characteristics.

EXTRACT:
1. Voice Markers: Unique phrases, expressions, or verbal tics the author uses frequently
2. Banned Words: Words or phrases that would feel off-brand or inauthentic (mark severity: 'hard' for never use, 'soft' for avoid)
3. Stances: Clear positions the author takes on industry topics
4. Signature Patterns: Structural patterns in how they communicate (e.g., "always opens with a question", "uses numbered lists")
5. Tone Profile: Rate these dimensions 0-100:
   - formal_casual: 0=very formal, 100=very casual
   - serious_playful: 0=very serious, 100=very playful
   - technical_accessible: 0=highly technical, 100=very accessible
   - reserved_expressive: 0=reserved, 100=highly expressive

Output JSON:
{
  "voiceMarkers": ["phrase1", "phrase2"],
  "bannedWords": [{"word": "word", "severity": "hard|soft", "reason": "why"}],
  "stances": [{"topic": "topic", "position": "their position"}],
  "signaturePatterns": ["pattern1", "pattern2"],
  "toneProfile": {
    "formal_casual": number,
    "serious_playful": number,
    "technical_accessible": number,
    "reserved_expressive": number
  }
}`;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
        messages: [
          { role: 'system', content: extractionPrompt },
          { role: 'user', content: `Content to analyze:\n${processedContent.substring(0, 8000)}` },
        ],
      });

      try {
        const text = (result as any).response;
        // Robust JSON extraction: remove markdown code blocks and find the first JSON object
        const cleanText = text.replace(/```json\n|\n```/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
        
        // Story 9.8: Validate with Zod
        return ExtractedEntitiesSchema.parse(parsed);
      } catch (error) {
        console.error('Failed to parse or validate extracted entities:', error);
        return {
          voiceMarkers: [],
          bannedWords: [],
          stances: [],
          signaturePatterns: [],
          toneProfile: {
            formal_casual: 50,
            serious_playful: 50,
            technical_accessible: 50,
            reserved_expressive: 50,
          },
        };
      }
    });

    // Step 4: Calculate DNA strength score before update
    const scoreBefore = await step.do('calculate-score-before', async () => {
      const dna = currentDNA as any;
      let score = 0;

      // Score based on completeness of DNA
      if (dna.voiceMarkers?.length > 0) score += 20;
      if (dna.voiceMarkers?.length >= 5) score += 10;
      if (dna.bannedWords?.length > 0) score += 15;
      if (dna.stances?.length > 0) score += 20;
      if (dna.stances?.length >= 3) score += 10;
      if (dna.signaturePatterns?.length > 0) score += 15;
      if (Object.keys(dna.toneProfile || {}).length > 0) score += 10;

      return Math.min(score, 100);
    });

    // Step 5: Merge with existing DNA (intelligent deduplication)
    const mergedDNA = await step.do('merge-dna', async () => {
      const current = currentDNA as any;

      // Merge voice markers (dedupe)
      // Current markers are objects from DB, extracted are strings from AI
      const currentMarkerPhrases = (current.voiceMarkers || []).map((m: any) => m.phrase);
      const voiceMarkers = [
        ...new Set([
          ...currentMarkerPhrases,
          ...extracted.voiceMarkers,
        ]),
      ];

      // Merge banned words (dedupe by word)
      const existingBanned = new Map(
        (current.bannedWords || []).map((b: any) => [b.word.toLowerCase(), b])
      );
      for (const newBanned of extracted.bannedWords) {
        if (!existingBanned.has(newBanned.word.toLowerCase())) {
          existingBanned.set(newBanned.word.toLowerCase(), newBanned);
        }
      }
      const bannedWords = Array.from(existingBanned.values());

      // Merge stances (dedupe by topic)
      const existingStances = new Map(
        (current.stances || []).map((s: any) => [s.topic.toLowerCase(), s])
      );
      for (const newStance of extracted.stances) {
        if (!existingStances.has(newStance.topic.toLowerCase())) {
          existingStances.set(newStance.topic.toLowerCase(), newStance);
        }
      }
      const stances = Array.from(existingStances.values());

      // Merge signature patterns (dedupe)
      const signaturePatterns = [
        ...new Set([
          ...(current.signaturePatterns || []),
          ...extracted.signaturePatterns,
        ]),
      ];

      // Blend tone profiles (weighted average favoring new data)
      const currentTone = current.toneProfile || {};
      const newTone = extracted.toneProfile;
      const toneProfile: Record<string, number> = {};

      for (const key of ['formal_casual', 'serious_playful', 'technical_accessible', 'reserved_expressive']) {
        const oldVal = currentTone[key] ?? 50;
        const newVal = newTone[key as keyof typeof newTone] ?? 50;
        // 70% weight to new data, 30% to existing
        toneProfile[key] = Math.round(oldVal * 0.3 + newVal * 0.7);
      }

      return {
        voiceMarkers,
        bannedWords,
        stances,
        signaturePatterns,
        toneProfile,
        lastCalibration: new Date().toISOString(),
      };
    });

    // Step 6: Update Brand DNA in Durable Object
    await step.do('update-dna', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'updateBrandDNA',
          params: mergedDNA,
        }),
      }));
    });

    // Step 7: Generate embeddings for voice markers
    await step.do('vectorize-voice', async () => {
      const textToEmbed = [
        ...mergedDNA.voiceMarkers,
        ...mergedDNA.signaturePatterns,
        ...mergedDNA.stances.map((s: any) => `${s.topic}: ${s.position}`),
      ].join('\n');

      if (textToEmbed.length > 0) {
        const result = await this.env.AI.run('@cf/baai/bge-base-en-v1.5' as any, {
          text: textToEmbed,
        }) as any;

        await this.env.VECTORIZE.upsert([
          {
            id: `brand-dna-${clientId}`,
            values: result.data[0],
            metadata: { clientId, type: 'brand-dna' },
          },
        ]);
      }
    });

    // Step 8: Calculate DNA strength score after update
    const scoreAfter = await step.do('calculate-score-after', async () => {
      let score = 0;

      if (mergedDNA.voiceMarkers.length > 0) score += 20;
      if (mergedDNA.voiceMarkers.length >= 5) score += 10;
      if (mergedDNA.bannedWords.length > 0) score += 15;
      if (mergedDNA.stances.length > 0) score += 20;
      if (mergedDNA.stances.length >= 3) score += 10;
      if (mergedDNA.signaturePatterns.length > 0) score += 15;
      if (Object.keys(mergedDNA.toneProfile).length > 0) score += 10;

      return Math.min(score, 100);
    });

    return {
      clientId,
      contentType,
      entitiesExtracted: {
        voiceMarkers: extracted.voiceMarkers.length,
        bannedWords: extracted.bannedWords.length,
        stances: extracted.stances.length,
        signaturePatterns: extracted.signaturePatterns.length,
      },
      dnaScoreBefore: scoreBefore,
      dnaScoreAfter: scoreAfter,
      improvement: scoreAfter - scoreBefore,
      lastCalibration: mergedDNA.lastCalibration,
    };
  }
}
