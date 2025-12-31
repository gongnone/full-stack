/**
 * VoiceRecorder Component Tests
 *
 * Story 1.5-1-2: Voice Recording Component (Mobile)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceRecorder } from './VoiceRecorder';

// Mock MediaRecorder and related APIs
const mockMediaRecorder = vi.fn();
const mockGetUserMedia = vi.fn();

// Setup mocks before each test
beforeEach(() => {
  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Reset mocks
  mockMediaRecorder.mockReset();
  mockGetUserMedia.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to setup MediaRecorder support
function setupMediaRecorderSupport() {
  // Use Object.defineProperty for read-only properties
  Object.defineProperty(global, 'MediaRecorder', {
    value: mockMediaRecorder,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(mockMediaRecorder, 'isTypeSupported', {
    value: vi.fn(() => true),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  });
}

// Helper to remove MediaRecorder support
function removeMediaRecorderSupport() {
  Object.defineProperty(global, 'MediaRecorder', {
    value: undefined,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

describe('VoiceRecorder', () => {
  const defaultProps = {
    onComplete: vi.fn(),
    onError: vi.fn(),
  };

  describe('AC1: Voice Recorder UI', () => {
    it('renders with timer display showing 00:00', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    it('shows max duration in timer', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} maxDuration={300} />);

      expect(screen.getByText(/\/ 05:00/)).toBeInTheDocument();
    });

    it('shows record button in idle state', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      const recordButton = screen.getByRole('button', { name: /start recording/i });
      expect(recordButton).toBeInTheDocument();
    });

    it('has touch-friendly button (44px minimum)', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      const recordButton = screen.getByRole('button', { name: /start recording/i });
      expect(recordButton).toHaveClass('min-h-[44px]');
      expect(recordButton).toHaveClass('min-w-[44px]');
    });

    it('shows waveform visualization area', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      // Waveform container exists
      const container = document.querySelector('.flex.items-center.justify-center.gap-0\\.5');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC6: Fallback for Unsupported Browsers', () => {
    it('shows fallback UI when MediaRecorder not supported', () => {
      removeMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      expect(screen.getByText(/Voice Recording Not Supported/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Audio File/i)).toBeInTheDocument();
    });

    it('allows file upload as fallback', () => {
      removeMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'audio/*');
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });

    it('shows recording tip for new users', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      expect(screen.getByText(/Tap the button to start recording/i)).toBeInTheDocument();
    });
  });

  describe('UI Elements', () => {
    it('displays timer in correct format', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} maxDuration={180} />);

      // Timer shows current time
      expect(screen.getByText('00:00')).toBeInTheDocument();
      // Timer shows max duration
      expect(screen.getByText('/ 03:00')).toBeInTheDocument();
    });

    it('uses Midnight Command theme colors', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      // Main container uses theme surface color
      const container = document.querySelector('.bg-\\[\\#1A1F26\\]');
      expect(container).toBeInTheDocument();

      // Border uses theme border color
      const borderedContainer = document.querySelector('.border-\\[\\#2A3038\\]');
      expect(borderedContainer).toBeInTheDocument();
    });

    it('record button is prominent red color', () => {
      setupMediaRecorderSupport();

      render(<VoiceRecorder {...defaultProps} />);

      const recordButton = screen.getByRole('button', { name: /start recording/i });
      expect(recordButton).toHaveClass('bg-[#F4212E]');
    });
  });
});
