import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 60,
  disabled = false,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check for microphone permission on mount (with Safari fallback)
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    // Safari doesn't fully support navigator.permissions.query for microphone
    // Check if we're on Safari and skip the permissions check
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      // On Safari, we can't pre-check permissions - will request on first use
      // Set to null to show neutral state (not denied, not granted)
      setHasPermission(null);
      return;
    }

    try {
      // Chrome, Firefox, Edge support this
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(result.state === 'granted');
      result.onchange = () => {
        setHasPermission(result.state === 'granted');
      };
    } catch {
      // Permissions API not supported or blocked, will request on first use
      setHasPermission(null);
    }
  };

  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        onRecordingComplete(audioBlob);
        setRecordingState('stopped');
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecordingState('recording');
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setHasPermission(false);
      setError('Microphone access denied. Please enable it in your browser settings.');
      console.error('Error accessing microphone:', err);
    }
  }, [maxDuration, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [recordingState]);

  const resetRecording = useCallback(() => {
    setRecordingState('idle');
    setDuration(0);
    audioChunksRef.current = [];
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (duration / maxDuration) * 100;

  return (
    <div className="space-y-4">
      {/* Recording visualizer */}
      <div
        className="relative h-32 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Progress bar */}
        {recordingState === 'recording' && (
          <div
            className="absolute bottom-0 left-0 h-1 transition-all duration-1000"
            style={{
              backgroundColor: 'var(--kill)',
              width: `${progressPercentage}%`,
            }}
          />
        )}

        {/* Center content */}
        <div className="flex flex-col items-center gap-3">
          {recordingState === 'idle' && (
            <>
              <button
                onClick={startRecording}
                disabled={disabled}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: 'var(--kill)' }}
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Click to start recording
              </p>
            </>
          )}

          {recordingState === 'recording' && (
            <>
              <div className="flex items-center gap-4">
                {/* Pulsing indicator */}
                <div className="relative">
                  <div
                    className="w-4 h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--kill)' }}
                  />
                  <div
                    className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: 'var(--kill)' }}
                  />
                </div>
                <span className="text-2xl font-mono" style={{ color: 'var(--text-primary)' }}>
                  {formatTime(duration)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  / {formatTime(maxDuration)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--kill)', color: 'white' }}
              >
                Stop Recording
              </button>
            </>
          )}

          {recordingState === 'stopped' && (
            <>
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--approve)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>
                  Recording complete ({formatTime(duration)})
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={resetRecording}
                className="text-sm"
              >
                Record Again
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Permission warning */}
      {hasPermission === false && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(244, 33, 46, 0.1)', color: 'var(--kill)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Microphone access is required. Please enable it in your browser settings and refresh the page.
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(244, 33, 46, 0.1)', color: 'var(--kill)' }}
        >
          {error}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Describe your brand personality, phrases you love, words to avoid, and your stance on topics.
        Recording is limited to {maxDuration} seconds.
      </p>
    </div>
  );
}
