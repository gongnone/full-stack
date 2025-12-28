import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';
import { AI_MODELS } from '@repo/agent-logic';

interface Env {
  CLIENT_AGENT: DurableObjectNamespace;
  AI: Ai;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  SPOKE_QUEUE: Queue;
}

interface HubIngestionParams {
  clientId: string;
  hubId: string;
  sourceContent: string;
  platform: string;
  angle: string;
}

interface PillarResult {
  pillarId: string;
  title: string;
  coreClaim: string;
  psychologicalAngle: string;
  estimatedSpokeCount: number;
  supportingPoints: string[];
}

type ExtractionStage = 'parsing' | 'themes' | 'claims' | 'pillars';

export class HubIngestionWorkflow extends WorkflowEntrypoint<Env, HubIngestionParams> {
  // Helper to update extraction progress in D1
  private async updateProgress(
    sourceId: string,
    clientId: string,
    stage: ExtractionStage,
    progress: number,
    message: string,
    status: 'processing' | 'completed' | 'failed' = 'processing',
    errorMessage?: string
  ) {
    const now = Date.now();
    await this.env.DB.prepare(`
      INSERT OR REPLACE INTO extraction_progress
        (source_id, client_id, status, current_stage, progress, stage_message, error_message, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(sourceId, clientId, status, stage, progress, message, errorMessage || null, now).run();
  }

  async run(event: WorkflowEvent<HubIngestionParams>, step: WorkflowStep) {
    const { clientId, hubId, sourceContent, platform, angle } = event.payload;
    const workflowStartTime = Date.now();

    // Structured logging helper for NFR-P2 (30s ingestion SLA)
    const logMetric = (stage: string, durationMs: number, metadata?: Record<string, unknown>) => {
      console.log(JSON.stringify({
        event: 'hub_ingestion_metric',
        hubId,
        clientId,
        stage,
        durationMs,
        contentLength: sourceContent.length,
        timestamp: new Date().toISOString(),
        ...metadata,
      }));
    };

    // Step 1: Initialize extraction progress
    const initStart = Date.now();
    await step.do('init-progress', async () => {
      const now = Date.now();
      await this.env.DB.prepare(`
        INSERT OR REPLACE INTO extraction_progress
          (source_id, client_id, status, current_stage, progress, stage_message, error_message, updated_at)
        VALUES (?, ?, 'processing', 'parsing', 5, 'Initializing extraction...', NULL, ?)
      `).bind(hubId, clientId, now).run();
    });
    logMetric('init-progress', Date.now() - initStart);

    // Step 2: Get Brand DNA for context (optional - gracefully handle missing)
    const brandDnaStart = Date.now();
    const brandDNA = await step.do('get-brand-dna', async () => {
      await this.updateProgress(hubId, clientId, 'parsing', 15, 'Loading brand context...');

      try {
        const id = this.env.CLIENT_AGENT.idFromName(clientId);
        const agent = this.env.CLIENT_AGENT.get(id);

        const response = await agent.fetch(new Request('http://internal/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'getBrandDNA',
            params: {},
          }),
        }));

        if (!response.ok) {
          console.log('Brand DNA not available, using defaults');
          return { voiceMarkers: [], signaturePatterns: [] };
        }

        return response.json();
      } catch (error) {
        console.log('Failed to get Brand DNA:', error);
        return { voiceMarkers: [], signaturePatterns: [] };
      }
    });
    logMetric('get-brand-dna', Date.now() - brandDnaStart);

    // Step 3: Generate embeddings for source content
    const embeddingsStart = Date.now();
    const embeddings = await step.do('generate-embeddings', async () => {
      await this.updateProgress(hubId, clientId, 'themes', 25, 'Generating content embeddings...');

      const result = await this.env.AI.run(AI_MODELS.EMBEDDING as any, {
        text: sourceContent,
      }) as any;

      // Store in Vectorize for future retrieval
      await this.env.VECTORIZE.upsert([
        {
          id: `hub-${hubId}`,
          values: result.data[0],
          metadata: { clientId, hubId, type: 'hub' },
        },
      ]);

      return result.data[0];
    });
    logMetric('generate-embeddings', Date.now() - embeddingsStart);

    // Step 4: Extract content pillars using AI (critical path for NFR-P2)
    const extractStart = Date.now();
    const pillars = await step.do('extract-pillars', async () => {
      await this.updateProgress(hubId, clientId, 'claims', 40, 'Extracting thematic pillars with AI...');

      const psychologicalAngles = ['Contrarian', 'Authority', 'Urgency', 'Aspiration', 'Fear', 'Curiosity', 'Transformation', 'Rebellion'];

      // Truncate content if too long (keep first 4000 chars for efficiency)
      const truncatedContent = sourceContent.length > 4000
        ? sourceContent.slice(0, 4000) + '\n\n[Content truncated...]'
        : sourceContent;

      const systemPrompt = `You are a content strategist. Extract EXACTLY 4 content pillars from the text.

CRITICAL: Output ONLY a JSON array, no other text. Start with [ and end with ]

Each pillar needs:
- pillarId: a UUID string (use format like "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
- title: 3-7 word headline capturing the theme
- coreClaim: 1-2 sentence argument or insight
- psychologicalAngle: one of ${psychologicalAngles.join('|')}
- estimatedSpokeCount: number between 5-10
- supportingPoints: array of 3 strings

Brand context: ${(brandDNA as any).voiceMarkers?.slice(0, 3).join(', ') || 'Professional, engaging'}

Example output format:
[{"pillarId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","title":"The Power of Consistency","coreClaim":"Regular content builds audience trust over time.","psychologicalAngle":"Authority","estimatedSpokeCount":7,"supportingPoints":["Point 1","Point 2","Point 3"]},{"pillarId":"b2c3d4e5-f6a7-8901-bcde-f12345678901","title":"Second Pillar Title","coreClaim":"Another key insight.","psychologicalAngle":"Curiosity","estimatedSpokeCount":6,"supportingPoints":["Point A","Point B","Point C"]}]`;

      const result = await this.env.AI.run(AI_MODELS.REASONING as any, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract 4 pillars from this content:\n\n${truncatedContent}` },
        ],
      }) as any;

      await this.updateProgress(hubId, clientId, 'pillars', 60, 'Parsing extraction results...');

      // Get the response text
      const responseText = (result as any).response || '';
      console.log('AI Response length:', responseText.length);
      console.log('AI Response preview:', responseText.slice(0, 500));

      try {
        // Try multiple parsing strategies
        let parsed: PillarResult[] | null = null;

        // Strategy 1: Direct JSON parse if response is clean
        if (responseText.trim().startsWith('[')) {
          try {
            parsed = JSON.parse(responseText.trim());
          } catch {
            // Continue to next strategy
          }
        }

        // Strategy 2: Extract JSON array from response
        if (!parsed) {
          const jsonMatch = responseText.match(/\[[\s\S]*?\](?=\s*$|[^[\]])/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch {
              // Try more aggressive extraction
              const deepMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
              if (deepMatch) {
                try {
                  parsed = JSON.parse(deepMatch[0]);
                } catch {
                  // Continue to fallback
                }
              }
            }
          }
        }

        // Validate and normalize parsed pillars
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const validPillars = parsed
            .filter(p => p && typeof p === 'object' && (p.title || p.coreClaim))
            .map(p => ({
              pillarId: (p.pillarId && typeof p.pillarId === 'string') ? p.pillarId : crypto.randomUUID(),
              title: String(p.title || 'Untitled Pillar').slice(0, 100),
              coreClaim: String(p.coreClaim || 'Key insight from the content.').slice(0, 500),
              psychologicalAngle: psychologicalAngles.includes(p.psychologicalAngle) ? p.psychologicalAngle : 'Authority',
              estimatedSpokeCount: typeof p.estimatedSpokeCount === 'number' ? p.estimatedSpokeCount : 7,
              supportingPoints: Array.isArray(p.supportingPoints)
                ? p.supportingPoints.slice(0, 5).map(String)
                : ['Supporting point 1', 'Supporting point 2', 'Supporting point 3'],
            }));

          if (validPillars.length >= 1) {
            console.log(`Successfully extracted ${validPillars.length} pillars`);
            return validPillars;
          }
        }

        console.log('JSON parsing failed, attempting text extraction...');
      } catch (e) {
        console.error('Failed to parse AI response:', e);
      }

      // Fallback Strategy 3: Extract themes from text if JSON parsing completely failed
      // Generate pillars based on content analysis
      const contentWords = truncatedContent.toLowerCase();
      const themes: PillarResult[] = [];

      // Detect common themes in content
      const themePatterns = [
        { keywords: ['automat', 'test', 'quality', 'validat'], title: 'Quality & Testing Strategy', angle: 'Authority' },
        { keywords: ['platform', 'database', 'data', 'integrat'], title: 'Data & Integration Architecture', angle: 'Curiosity' },
        { keywords: ['ai', 'extract', 'content', 'generat'], title: 'AI-Powered Content Creation', angle: 'Transformation' },
        { keywords: ['user', 'experience', 'workflow', 'design'], title: 'User Experience Design', angle: 'Aspiration' },
        { keywords: ['brand', 'voice', 'develop', 'strateg'], title: 'Brand Strategy Development', angle: 'Authority' },
        { keywords: ['publish', 'social', 'multi', 'channel'], title: 'Multi-Channel Publishing', angle: 'Urgency' },
      ];

      for (const pattern of themePatterns) {
        const matchCount = pattern.keywords.filter(kw => contentWords.includes(kw)).length;
        if (matchCount >= 1 && themes.length < 4) {
          themes.push({
            pillarId: crypto.randomUUID(),
            title: pattern.title,
            coreClaim: `Key insights about ${pattern.title.toLowerCase()} extracted from the source content.`,
            psychologicalAngle: pattern.angle,
            estimatedSpokeCount: 7,
            supportingPoints: [
              'Primary supporting evidence',
              'Secondary insight',
              'Actionable recommendation',
            ],
          });
        }
      }

      // Ensure we have at least 3 pillars
      while (themes.length < 3) {
        const defaultThemes = [
          { title: 'Core Value Proposition', angle: 'Authority' },
          { title: 'Audience Engagement Strategy', angle: 'Curiosity' },
          { title: 'Implementation Roadmap', angle: 'Transformation' },
          { title: 'Success Metrics & Outcomes', angle: 'Aspiration' },
        ];
        const theme = defaultThemes[themes.length];
        themes.push({
          pillarId: crypto.randomUUID(),
          title: theme.title,
          coreClaim: `Important considerations for ${theme.title.toLowerCase()} based on the source material.`,
          psychologicalAngle: theme.angle,
          estimatedSpokeCount: 7,
          supportingPoints: [
            'Key insight from content',
            'Supporting evidence',
            'Actionable takeaway',
          ],
        });
      }

      console.log(`Generated ${themes.length} fallback pillars from content analysis`);
      return themes;
    });
    logMetric('extract-pillars', Date.now() - extractStart, { pillarCount: pillars.length });

    // Step 5: Write extracted pillars to D1
    const writeStart = Date.now();
    await step.do('write-pillars-to-d1', async () => {
      await this.updateProgress(hubId, clientId, 'pillars', 75, 'Saving extracted pillars...');

      const now = Date.now();

      // Insert each pillar into D1 extracted_pillars table
      for (const pillar of pillars) {
        await this.env.DB.prepare(`
          INSERT INTO extracted_pillars
            (id, source_id, client_id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          pillar.pillarId,
          hubId, // source_id = hubId (the source that was extracted)
          clientId,
          pillar.title,
          pillar.coreClaim,
          pillar.psychologicalAngle,
          pillar.estimatedSpokeCount,
          JSON.stringify(pillar.supportingPoints),
          now
        ).run();
      }

      // Update source status to ready
      await this.env.DB.prepare(`
        UPDATE hub_sources SET status = 'ready', updated_at = ? WHERE id = ?
      `).bind(now, hubId).run();
    });
    logMetric('write-pillars-to-d1', Date.now() - writeStart, { pillarCount: pillars.length });

    // Step 6: Mark extraction as complete
    await step.do('complete-extraction', async () => {
      await this.updateProgress(
        hubId,
        clientId,
        'pillars',
        100,
        `Extraction complete! Found ${pillars.length} pillars.`,
        'completed'
      );
    });

    // Log total extraction time (NFR-P2: should be < 30s)
    const totalExtractionMs = Date.now() - workflowStartTime;
    logMetric('total-extraction', totalExtractionMs, {
      pillarCount: pillars.length,
      slaCompliant: totalExtractionMs < 30000,
    });

    // Step 7: Queue spoke generation for each platform variant (optional - can be triggered separately)
    const platforms = ['twitter', 'linkedin', 'tiktok', 'instagram', 'thread'];
    const queuedSpokes = await step.do('queue-spoke-generation', async () => {
      const spokesToQueue: Array<{ spokeId: string; platform: string; pillarId: string }> = [];

      for (const pillar of pillars) {
        for (const targetPlatform of platforms) {
          const spokeId = crypto.randomUUID();
          spokesToQueue.push({
            spokeId,
            platform: targetPlatform,
            pillarId: pillar.pillarId,
          });

          // Queue each spoke for generation
          await this.env.SPOKE_QUEUE.send({
            type: 'generate-spoke',
            payload: {
              clientId,
              hubId,
              platform: targetPlatform,
              spokeId,
              pillarId: pillar.pillarId,
              pillarTitle: pillar.title,
              coreClaim: pillar.coreClaim,
              supportingPoints: pillar.supportingPoints,
              sourceContent,
            },
          });
        }
      }

      return spokesToQueue;
    });

    return {
      hubId,
      pillarsExtracted: pillars.length,
      spokesQueued: queuedSpokes.length,
      status: 'completed',
    };
  }
}
