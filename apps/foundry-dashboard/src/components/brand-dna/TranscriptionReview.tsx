interface ExtractedEntities {
  bannedWords: string[];
  voiceMarkers: string[];
  stances: Array<{ topic: string; position: string }>;
}

interface TranscriptionReviewProps {
  transcript: string;
  entities: ExtractedEntities;
  dnaScoreBefore: number;
  dnaScoreAfter: number;
  isProcessing?: boolean;
}

export function TranscriptionReview({
  transcript,
  entities,
  dnaScoreBefore,
  dnaScoreAfter,
  isProcessing = false,
}: TranscriptionReviewProps) {
  const improvement = dnaScoreAfter - dnaScoreBefore;

  if (isProcessing) {
    return (
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin border-2"
            style={{
              borderColor: 'var(--border-subtle)',
              borderTopColor: 'var(--edit)',
            }}
          />
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Processing your voice note...
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Transcribing audio and extracting brand entities
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score improvement banner */}
      {improvement > 0 && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(0, 210, 106, 0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--approve)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Brand DNA Updated
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Voice note processed successfully
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold" style={{ color: 'var(--approve)' }}>
              +{improvement}%
            </span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              DNA strength
            </p>
          </div>
        </div>
      )}

      {/* Transcription */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Transcription
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {transcript || 'No transcription available'}
        </p>
      </div>

      {/* Extracted entities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Voice Markers */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--edit)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Voice Markers
            </h3>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {entities.voiceMarkers.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entities.voiceMarkers.length > 0 ? (
              entities.voiceMarkers.map((marker, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md text-xs"
                  style={{ backgroundColor: 'rgba(29, 155, 240, 0.15)', color: 'var(--edit)' }}
                >
                  {marker}
                </span>
              ))
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No markers detected
              </p>
            )}
          </div>
        </div>

        {/* Banned Words */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--kill)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Banned Words
            </h3>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {entities.bannedWords.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entities.bannedWords.length > 0 ? (
              entities.bannedWords.map((word, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md text-xs line-through"
                  style={{ backgroundColor: 'rgba(244, 33, 46, 0.15)', color: 'var(--kill)' }}
                >
                  {word}
                </span>
              ))
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No banned words detected
              </p>
            )}
          </div>
        </div>

        {/* Brand Stances */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--approve)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Brand Stances
            </h3>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {entities.stances.length}
            </span>
          </div>
          <div className="space-y-2">
            {entities.stances.length > 0 ? (
              entities.stances.map((stance, i) => (
                <div
                  key={i}
                  className="p-2 rounded-md text-xs"
                  style={{ backgroundColor: 'rgba(0, 210, 106, 0.1)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {stance.topic}:
                  </span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{stance.position}</span>
                </div>
              ))
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No stances detected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
