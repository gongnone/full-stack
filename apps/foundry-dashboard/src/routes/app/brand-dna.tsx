import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import {
  FileDropZone,
  TrainingSamplesList,
  TextPasteModal,
  SampleStats,
  VoiceRecorder,
  TranscriptionReview,
} from '@/components/brand-dna';

/**
 * Brand DNA page for training sample management
 * Story 2.1: Multi-Source Content Ingestion for Brand Analysis
 * Story 2.2: Voice-to-Grounding Pipeline
 *
 * AC1: Drag and drop PDF file, uploads to R2 with progress indicator
 * AC2: File appears in "Training Samples" list
 * AC3: Text is extracted using Workers AI (post-upload processing)
 * AC4: View samples with: source icon, title, word count, quality badge
 *
 * Story 2.2 ACs:
 * AC1: Microphone icon → recording interface with timer (max 60s)
 * AC2: Audio stored in R2, Whisper transcribes, display for review
 * AC3: Entity extraction: voice markers, banned words, brand stances
 * AC4: Example: "Stop using corporate jargon like synergy" → synergy banned
 */
export const Route = createFileRoute('/app/brand-dna')({
  component: BrandDNAPage,
});

interface VoiceResult {
  calibrationId: string;
  recordingId: string;
  transcript: string;
  entitiesExtracted: {
    bannedWords: string[];
    voiceMarkers: string[];
    stances: Array<{ topic: string; position: string }>;
  };
  dnaScoreBefore: number;
  dnaScoreAfter: number;
}

function BrandDNAPage() {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Story 2.2: Voice recording state
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);

  // Get client ID from authenticated session (Rule 1: Isolation Above All)
  const clientId = useClientId();

  // tRPC queries - only run when clientId is available
  const samplesQuery = trpc.calibration.listSamples.useQuery({
    clientId: clientId || '',
    limit: 50,
  }, {
    enabled: !!clientId,
  });

  const statsQuery = trpc.calibration.getSampleStats.useQuery({
    clientId: clientId || '',
  }, {
    enabled: !!clientId,
  });

  const brandDNAQuery = trpc.calibration.getBrandDNA.useQuery({
    clientId: clientId || '',
  }, {
    enabled: !!clientId,
  });

  // tRPC mutations
  const getUploadUrl = trpc.calibration.getUploadUrl.useMutation();
  const registerFileSample = trpc.calibration.registerFileSample.useMutation();
  const createTextSample = trpc.calibration.createTextSample.useMutation();
  const deleteSample = trpc.calibration.deleteSample.useMutation();

  // Story 2.2: Voice mutations
  const getVoiceUploadUrl = trpc.calibration.getVoiceUploadUrl.useMutation();
  const recordVoice = trpc.calibration.recordVoice.useMutation();

  const utils = trpc.useUtils();

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get upload URL
      if (!clientId) throw new Error('Not authenticated');
      const { r2Key, uploadEndpoint } = await getUploadUrl.mutateAsync({
        clientId,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      });

      setUploadProgress(20);

      // Upload file to R2
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(80);

      // Determine source type from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const sourceType = ext === 'pdf' ? 'pdf' as const :
        ext === 'txt' || ext === 'md' ? 'transcript' as const : 'article' as const;

      // Register the file as a training sample
      await registerFileSample.mutateAsync({
        clientId: clientId,
        title: file.name.replace(/\.[^.]+$/, ''), // Remove extension for title
        r2Key,
        sourceType,
        fileSize: file.size,
      });

      setUploadProgress(100);

      // Refresh data
      await Promise.all([
        utils.calibration.listSamples.invalidate(),
        utils.calibration.getSampleStats.invalidate(),
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      // TODO: Show error toast
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [clientId, getUploadUrl, registerFileSample, utils]);

  // Handle text paste submission
  const handleTextSubmit = useCallback(async (title: string, content: string) => {
    if (!clientId) throw new Error('Not authenticated');
    try {
      await createTextSample.mutateAsync({
        clientId,
        title,
        content,
      });

      setIsTextModalOpen(false);

      // Refresh data
      await Promise.all([
        utils.calibration.listSamples.invalidate(),
        utils.calibration.getSampleStats.invalidate(),
      ]);
    } catch (error) {
      console.error('Create sample error:', error);
      // TODO: Show error toast
    }
  }, [clientId, createTextSample, utils]);

  // Handle sample deletion
  const handleDelete = useCallback(async (sampleId: string) => {
    if (!clientId) throw new Error('Not authenticated');
    try {
      setDeletingId(sampleId);

      await deleteSample.mutateAsync({
        sampleId,
        clientId,
      });

      // Refresh data
      await Promise.all([
        utils.calibration.listSamples.invalidate(),
        utils.calibration.getSampleStats.invalidate(),
      ]);
    } catch (error) {
      console.error('Delete error:', error);
      // TODO: Show error toast
    } finally {
      setDeletingId(null);
    }
  }, [clientId, deleteSample, utils]);

  // Story 2.2: Handle voice recording completion
  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (!clientId) throw new Error('Not authenticated');
    setIsProcessingVoice(true);
    setVoiceResult(null);

    try {
      // Step 1: Get upload URL from backend
      const { r2Key, uploadEndpoint } = await getVoiceUploadUrl.mutateAsync({
        clientId,
        filename: `voice-note-${Date.now()}.webm`,
      });

      // Step 2: Upload audio to R2
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const uploadResponse = await fetch(`${apiUrl}${uploadEndpoint}`, {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': audioBlob.type || 'audio/webm',
        },
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio');
      }

      // Step 3: Process the voice note (Whisper transcription + entity extraction)
      const result = await recordVoice.mutateAsync({
        clientId,
        audioR2Key: r2Key,
      });

      setVoiceResult(result);

      // Refresh stats and samples
      await Promise.all([
        utils.calibration.listSamples.invalidate(),
        utils.calibration.getSampleStats.invalidate(),
        utils.calibration.getBrandDNA.invalidate(),
      ]);
    } catch (error) {
      console.error('Voice processing error:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessingVoice(false);
    }
  }, [clientId, getVoiceUploadUrl, recordVoice, utils]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Brand DNA
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Upload content or record voice notes to teach the system your brand voice
          </p>
        </div>

        {/* DNA Strength Score */}
        {brandDNAQuery.data && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {brandDNAQuery.data.dnaStrength}%
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    brandDNAQuery.data.dnaStrength >= 80
                      ? 'var(--approve)'
                      : brandDNAQuery.data.dnaStrength >= 50
                      ? 'var(--warning)'
                      : 'var(--kill)',
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              DNA Strength
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <section>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Voice Profile Status
        </h2>
        <SampleStats
          totalSamples={statsQuery.data?.totalSamples ?? 0}
          totalWords={statsQuery.data?.totalWords ?? 0}
          averageQuality={statsQuery.data?.averageQuality ?? null}
          analyzedCount={statsQuery.data?.analyzedCount ?? 0}
          pendingCount={statsQuery.data?.pendingCount ?? 0}
          processingCount={statsQuery.data?.processingCount ?? 0}
          failedCount={statsQuery.data?.failedCount ?? 0}
          recommendation={statsQuery.data?.recommendation ?? 'Add samples to get started'}
          isLoading={statsQuery.isLoading}
        />
      </section>

      {/* Story 2.2: Voice Recording Section */}
      <section>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Voice-to-Grounding Pipeline
        </h2>
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(244, 33, 46, 0.15)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--kill)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Record a Voice Note
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Describe your brand personality, phrases you love, words to avoid, and your stance on topics.
                The system will extract entities and update your Brand DNA.
              </p>
            </div>
          </div>

          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={60}
            disabled={isProcessingVoice}
          />

          {/* Processing or Results */}
          {(isProcessingVoice || voiceResult) && (
            <TranscriptionReview
              transcript={voiceResult?.transcript || ''}
              entities={voiceResult?.entitiesExtracted || { bannedWords: [], voiceMarkers: [], stances: [] }}
              dnaScoreBefore={voiceResult?.dnaScoreBefore || 0}
              dnaScoreAfter={voiceResult?.dnaScoreAfter || 0}
              isProcessing={isProcessingVoice}
            />
          )}
        </div>
      </section>

      {/* Upload Section */}
      <section>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Add Training Content
        </h2>
        <FileDropZone
          onFileSelect={handleFileSelect}
          onTextPaste={() => setIsTextModalOpen(true)}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </section>

      {/* Samples List Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Training Samples
          </h2>
          {samplesQuery.data && samplesQuery.data.total > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {samplesQuery.data.total} sample{samplesQuery.data.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <TrainingSamplesList
          samples={samplesQuery.data?.samples ?? []}
          isLoading={samplesQuery.isLoading}
          onDelete={handleDelete}
          isDeleting={deletingId}
        />
      </section>

      {/* Text Paste Modal */}
      <TextPasteModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSubmit={handleTextSubmit}
        isSubmitting={createTextSample.isPending}
      />

      {/* Keyboard Hints */}
      <div
        className="text-xs py-4 border-t"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}
      >
        <span className="font-medium">Tip:</span> Upload at least 3 samples for basic Brand DNA analysis.
        The more quality content you provide, the better the system learns your voice.
      </div>
    </div>
  );
}
