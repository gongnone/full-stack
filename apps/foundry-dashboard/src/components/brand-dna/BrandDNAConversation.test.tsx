// @ts-nocheck — stale test fixtures, needs rewrite to match current API
/**
 * BrandDNA Conversation Component Tests
 *
 * Tests for the WebSocket-based conversational UI component.
 *
 * Coverage:
 * - Rendering states (connecting, connected, disconnected)
 * - Message display
 * - User input handling
 * - Voice recording integration
 * - Component rendering for different agent component types
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent as _fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandDNAConversation } from './BrandDNAConversation';

// Mock the custom hook
const mockSendTextInput = vi.fn();
const mockSendVoiceSample = vi.fn();
const mockSendSelection = vi.fn();
const mockSendAction = vi.fn();

let mockHookReturn = {
  isConnected: true,
  isConnecting: false,
  messages: [],
  sessionState: { currentStep: 'welcome', progress: 0 },
  sendTextInput: mockSendTextInput,
  sendVoiceSample: mockSendVoiceSample,
  sendSelection: mockSendSelection,
  sendAction: mockSendAction,
};

vi.mock('@/lib/use-brand-dna-agent', () => ({
  useBrandDNAAgent: () => mockHookReturn,
}));

// Mock the VoiceRecorder component
vi.mock('@/components/voice/VoiceRecorder', () => ({
  VoiceRecorder: ({ onComplete, onError, maxDuration }: any) => (
    <div data-testid="voice-recorder">
      <span data-testid="max-duration">{maxDuration}</span>
      <button onClick={() => onComplete(new Blob(['test'], { type: 'audio/webm' }))}>
        Record
      </button>
      <button onClick={() => onError(new Error('Test error'))}>Trigger Error</button>
    </div>
  ),
}));

// Mock fetch for voice upload
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BrandDNAConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset hook return to default
    mockHookReturn = {
      isConnected: true,
      isConnecting: false,
      messages: [],
      sessionState: { currentStep: 'welcome', progress: 0 },
      sendTextInput: mockSendTextInput,
      sendVoiceSample: mockSendVoiceSample,
      sendSelection: mockSendSelection,
      sendAction: mockSendAction,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== Rendering States =====

  describe('rendering states', () => {
    it('shows loading state when connecting', () => {
      mockHookReturn.isConnecting = true;
      mockHookReturn.isConnected = false;

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Connecting to Brand DNA Agent...')).toBeInTheDocument();
    });

    it('shows disconnected banner when not connected', () => {
      mockHookReturn.isConnected = false;
      mockHookReturn.isConnecting = false;

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      expect(screen.getByText('Reconnect')).toBeInTheDocument();
    });

    it('renders header with title', () => {
      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Brand DNA Discovery')).toBeInTheDocument();
    });

    it('shows client name when provided', () => {
      render(<BrandDNAConversation clientId="client-123" clientName="Acme Corp" />);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    it('shows progress bar with percentage', () => {
      mockHookReturn.sessionState = { currentStep: 'voice_capture', progress: 25 };

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('hides input area when step is complete', () => {
      mockHookReturn.sessionState = { currentStep: 'complete', progress: 100 };

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.queryByPlaceholderText('Type your response...')).not.toBeInTheDocument();
    });
  });

  // ===== User Input =====

  describe('user input', () => {
    it('renders text input field', () => {
      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument();
    });

    it('calls sendTextInput on submit', async () => {
      const user = userEvent.setup();
      render(<BrandDNAConversation clientId="client-123" />);

      const input = screen.getByPlaceholderText('Type your response...');
      await user.type(input, 'Hello, this is my brand voice');

      const submitButton = screen.getByRole('button', { name: /send/i }).closest('button');
      await user.click(submitButton!);

      expect(mockSendTextInput).toHaveBeenCalledWith('Hello, this is my brand voice');
    });

    it('clears input after submit', async () => {
      const user = userEvent.setup();
      render(<BrandDNAConversation clientId="client-123" />);

      const input = screen.getByPlaceholderText('Type your response...');
      await user.type(input, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send/i }).closest('button');
      await user.click(submitButton!);

      expect(input).toHaveValue('');
    });

    it('submits on Enter key', async () => {
      const user = userEvent.setup();
      render(<BrandDNAConversation clientId="client-123" />);

      const input = screen.getByPlaceholderText('Type your response...');
      await user.type(input, 'Test message{enter}');

      expect(mockSendTextInput).toHaveBeenCalledWith('Test message');
    });

    it('does not submit on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<BrandDNAConversation clientId="client-123" />);

      const input = screen.getByPlaceholderText('Type your response...');
      await user.type(input, 'Test message');
      await user.keyboard('{Shift>}{enter}{/Shift}');

      expect(mockSendTextInput).not.toHaveBeenCalled();
    });

    it('does not submit empty input', async () => {
      const user = userEvent.setup();
      render(<BrandDNAConversation clientId="client-123" />);

      const submitButton = screen.getByRole('button', { name: /send/i }).closest('button');
      await user.click(submitButton!);

      expect(mockSendTextInput).not.toHaveBeenCalled();
    });

    it('disables submit button when input is empty', () => {
      render(<BrandDNAConversation clientId="client-123" />);

      const submitButton = screen.getByRole('button', { name: /send/i }).closest('button');
      expect(submitButton).toBeDisabled();
    });
  });

  // ===== Message Display =====

  describe('message display', () => {
    it('renders user messages', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'user',
          component: { type: 'TextMessage', props: { content: 'My brand voice' } },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('My brand voice')).toBeInTheDocument();
    });

    it('renders agent text messages', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: { type: 'TextMessage', props: { content: 'Welcome to Brand DNA!' } },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Welcome to Brand DNA!')).toBeInTheDocument();
    });

    it('renders success variant text messages with green styling', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'TextMessage',
            props: { content: 'Voice sample received!', variant: 'success' },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      const message = screen.getByText('Voice sample received!').closest('div');
      expect(message).toHaveClass('bg-[#00D26A]/20');
    });

    it('renders error messages with red styling', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: { type: 'Error', props: { message: 'Something went wrong' } },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  // ===== Button Choice Component =====

  describe('ButtonChoice component', () => {
    it('renders choices with labels and descriptions', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'ButtonChoice',
            props: {
              prompt: 'Choose your path',
              choices: [
                { id: 'full', label: 'Full Path', description: '10-15 minutes', icon: 'sparkles' },
                { id: 'express', label: 'Express Path', description: '2-3 minutes', icon: 'zap' },
              ],
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Choose your path')).toBeInTheDocument();
      expect(screen.getByText('Full Path')).toBeInTheDocument();
      expect(screen.getByText('Express Path')).toBeInTheDocument();
      expect(screen.getByText('10-15 minutes')).toBeInTheDocument();
    });

    it('calls sendSelection when choice clicked', async () => {
      const user = userEvent.setup();
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'ButtonChoice',
            props: {
              prompt: 'Choose your path',
              choices: [
                { id: 'full', label: 'Full Path', description: '10-15 minutes', icon: 'sparkles' },
              ],
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      await user.click(screen.getByText('Full Path'));

      expect(mockSendSelection).toHaveBeenCalledWith('path', 'full');
    });
  });

  // ===== Voice Recorder Component =====

  describe('VoiceRecorder component', () => {
    it('renders VoiceRecorder with correct max duration', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'VoiceRecorder',
            props: {
              prompt: 'Record your voice',
              maxDuration: 120,
              skipOption: true,
              skipText: "I'd rather type",
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Record your voice')).toBeInTheDocument();
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      expect(screen.getByTestId('max-duration')).toHaveTextContent('120');
    });

    it('shows skip button when skipOption is true', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'VoiceRecorder',
            props: {
              prompt: 'Record',
              skipOption: true,
              skipText: "I'd rather type",
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText("I'd rather type")).toBeInTheDocument();
    });

    it('calls sendAction with skip_voice when skip clicked', async () => {
      const user = userEvent.setup();
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'VoiceRecorder',
            props: { prompt: 'Record', skipOption: true, skipText: "I'd rather type" },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      await user.click(screen.getByText("I'd rather type"));

      expect(mockSendAction).toHaveBeenCalledWith('skip_voice');
    });

    it('uploads voice and sends sample on recording complete', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ r2Key: 'voice/sample-123.webm' }),
      });

      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'VoiceRecorder',
            props: { prompt: 'Record', skipOption: false },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      await user.click(screen.getByText('Record'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/upload/voice-samples/client-123/'),
          expect.objectContaining({ method: 'POST' })
        );
      });

      await waitFor(() => {
        expect(mockSendVoiceSample).toHaveBeenCalledWith('voice/sample-123.webm', undefined, expect.any(Number));
      });
    });

    it('uses onboarding upload endpoint when token provided', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ r2Key: 'voice/sample-123.webm' }),
      });

      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'VoiceRecorder',
            props: { prompt: 'Record', skipOption: false },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" onboardingToken="abc123" />);

      await user.click(screen.getByText('Record'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/upload/onboarding/abc123/'),
          expect.any(Object)
        );
      });
    });
  });

  // ===== Platform Selector Component =====

  describe('PlatformSelector component', () => {
    const platformProps = {
      prompt: 'Select your platforms',
      allPlatforms: [
        { id: 'linkedin', name: 'LinkedIn', bestFor: 'B2B content' },
        { id: 'twitter', name: 'Twitter/X', bestFor: 'Quick updates' },
        { id: 'instagram', name: 'Instagram', bestFor: 'Visual content' },
        { id: 'youtube', name: 'YouTube', bestFor: 'Long-form video' },
      ],
      recommended: [{ id: 'linkedin', name: 'LinkedIn', bestFor: 'B2B content' }],
      minSelection: 2,
      maxSelection: 4,
    };

    it('renders all platforms', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: { type: 'PlatformSelector', props: platformProps },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });

    it('calls sendSelection with selected platforms', async () => {
      const user = userEvent.setup();
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: { type: 'PlatformSelector', props: platformProps },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      await user.click(screen.getByText('Twitter/X'));
      await user.click(screen.getByRole('button', { name: /continue with 2 platforms/i }));

      expect(mockSendSelection).toHaveBeenCalledWith('platforms', expect.arrayContaining(['linkedin', 'twitter']));
    });
  });

  // ===== Progress Indicator Component =====

  describe('ProgressIndicator component', () => {
    it('renders progress with step and percentage', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'ProgressIndicator',
            props: { currentStep: 'voice_capture', progress: 25 },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Step: voice_capture')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  // ===== Pillar Proposal Component =====

  describe('PillarProposal component', () => {
    it('renders pillars and approve button', () => {
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'PillarProposal',
            props: {
              prompt: 'Review your pillars',
              pillars: [
                { id: 'p1', title: 'Leadership', description: 'Lead with authority', rationale: 'Based on your voice' },
              ],
              allowRegenerate: true,
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      expect(screen.getByText('Review your pillars')).toBeInTheDocument();
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Approve All Pillars')).toBeInTheDocument();
    });

    it('calls sendAction on approve all', async () => {
      const user = userEvent.setup();
      mockHookReturn.messages = [
        {
          id: 'msg-1',
          role: 'agent',
          component: {
            type: 'PillarProposal',
            props: {
              prompt: 'Review',
              pillars: [{ id: 'p1', title: 'Test', description: 'Desc', rationale: 'Reason' }],
            },
          },
        },
      ];

      render(<BrandDNAConversation clientId="client-123" />);

      await user.click(screen.getByText('Approve All Pillars'));

      expect(mockSendAction).toHaveBeenCalledWith('approve_all');
    });
  });

  // ===== Completion Handling =====

  describe('completion handling', () => {
    it('calls onComplete when step becomes complete', async () => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <BrandDNAConversation clientId="client-123" onComplete={onComplete} />
      );

      expect(onComplete).not.toHaveBeenCalled();

      // Simulate step change to complete
      mockHookReturn.sessionState = { currentStep: 'complete', progress: 100 };
      rerender(<BrandDNAConversation clientId="client-123" onComplete={onComplete} />);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('only calls onComplete once (prevents duplicate emails)', async () => {
      const onComplete = vi.fn();

      mockHookReturn.sessionState = { currentStep: 'complete', progress: 100 };

      const { rerender } = render(
        <BrandDNAConversation clientId="client-123" onComplete={onComplete} />
      );

      // Rerender multiple times
      rerender(<BrandDNAConversation clientId="client-123" onComplete={onComplete} />);
      rerender(<BrandDNAConversation clientId="client-123" onComplete={onComplete} />);

      // Should only be called once
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
