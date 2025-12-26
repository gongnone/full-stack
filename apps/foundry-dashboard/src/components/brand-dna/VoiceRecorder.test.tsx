/**
 * Story 2.2: VoiceRecorder - Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { VoiceRecorder } from './VoiceRecorder';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock MediaRecorder as a class
class MockMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);

  state = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  mimeType = 'audio/webm';

  start = vi.fn().mockImplementation(() => {
    this.state = 'recording';
  });

  stop = vi.fn().mockImplementation(() => {
    this.state = 'inactive';
    // Trigger onstop callback
    if (this.onstop) {
      this.onstop();
    }
  });
}

// Mock MediaStream
const mockStream = {
  getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
};

describe('VoiceRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    // Mock navigator.permissions.query
    Object.defineProperty(global.navigator, 'permissions', {
      value: {
        query: vi.fn().mockResolvedValue({ state: 'prompt', onchange: null }),
      },
      writable: true,
      configurable: true,
    });

    // Mock navigator.userAgent (not Safari)
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Chrome/120.0.0.0',
      writable: true,
      configurable: true,
    });

    // Mock MediaRecorder constructor
    (global as any).MediaRecorder = MockMediaRecorder;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders initial idle state', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByLabelText('Start Recording')).toBeInTheDocument();
      expect(screen.getByText('Click to start recording')).toBeInTheDocument();
    });

    it('shows max duration hint', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} maxDuration={60} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByText(/Recording is limited to 60 seconds/)).toBeInTheDocument();
    });

    it('disables button when disabled prop is true', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} disabled={true} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(screen.getByLabelText('Start Recording')).toBeDisabled();
    });
  });

  describe('Recording Flow', () => {
    it('requests microphone permission when start clicked', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it('shows Stop Recording button during recording', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    });

    it('shows duration timer during recording', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      // Initial time
      expect(screen.getByText('0:00')).toBeInTheDocument();

      // After 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('0:02')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error when microphone access denied', async () => {
      vi.useRealTimers(); // Use real timers for async error handling

      const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true,
        configurable: true,
      });

      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(screen.getByText(/Microphone access denied/)).toBeInTheDocument();
    });

    it('calls addToast on error', async () => {
      vi.useRealTimers(); // Use real timers for async error handling

      const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true,
        configurable: true,
      });

      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining('Microphone access denied'),
        'error',
        expect.any(Number)
      );
    });
  });

  describe('Completion', () => {
    it('shows completion state after recording', async () => {
      const onComplete = vi.fn();
      render(<VoiceRecorder onRecordingComplete={onComplete} />);

      await act(async () => {
        vi.runAllTimers();
      });

      // Start recording
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Stop recording
      await act(async () => {
        fireEvent.click(screen.getByText('Stop Recording'));
        vi.runAllTimers();
      });

      expect(screen.getByText(/Recording complete/)).toBeInTheDocument();
      expect(screen.getByText('Record Again')).toBeInTheDocument();
    });

    it('calls onRecordingComplete callback', async () => {
      const onComplete = vi.fn();
      render(<VoiceRecorder onRecordingComplete={onComplete} />);

      await act(async () => {
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Stop Recording'));
        vi.runAllTimers();
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('resets to idle when Record Again clicked', async () => {
      render(<VoiceRecorder onRecordingComplete={vi.fn()} />);

      await act(async () => {
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Start Recording'));
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Stop Recording'));
        vi.runAllTimers();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Record Again'));
      });

      expect(screen.getByLabelText('Start Recording')).toBeInTheDocument();
      expect(screen.getByText('Click to start recording')).toBeInTheDocument();
    });
  });
});
