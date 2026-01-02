/**
 * BrandDNA Conversation Component
 *
 * WebSocket-based conversational UI for BrandDNA Agent.
 * Implements PRD 1.5 agentic conversation flow.
 */

import { useEffect, useRef, useState } from 'react';
import {
  useBrandDNAAgent,
  type AgentComponent,
  type ConversationMessage,
} from '@/lib/use-brand-dna-agent';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { Sparkles, Zap, Send, Check, Loader2, RefreshCw } from 'lucide-react';

interface BrandDNAConversationProps {
  clientId: string;
  clientName?: string;
  onComplete?: () => void;
  /** Token for unauthenticated onboarding uploads */
  onboardingToken?: string;
}

export function BrandDNAConversation({
  clientId,
  clientName,
  onComplete,
  onboardingToken,
}: BrandDNAConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const hasCompletedRef = useRef(false); // Guard against multiple completion calls

  const {
    isConnected,
    isConnecting,
    messages,
    sessionState,
    sendTextInput,
    sendVoiceSample,
    sendSelection,
    sendAction,
  } = useBrandDNAAgent({
    clientId,
    onError: (error) => console.error('Agent error:', error),
    onConnected: () => console.log('Connected to BrandDNA Agent'),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle completion - only call onComplete once to prevent duplicate emails
  useEffect(() => {
    if (sessionState?.currentStep === 'complete' && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [sessionState, onComplete]);

  const handleSubmitText = () => {
    if (inputText.trim()) {
      sendTextInput(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitText();
    }
  };

  const handleVoiceComplete = (blob: Blob) => {
    // Upload to R2 first, then send to agent
    const uploadVoice = async () => {
      try {
        const filename = `voice-${Date.now()}.webm`;
        // Use onboarding endpoint if token provided (unauthenticated), else use standard auth endpoint
        const url = onboardingToken
          ? `${import.meta.env.VITE_API_URL || ''}/api/upload/onboarding/${onboardingToken}/${encodeURIComponent(filename)}`
          : `${import.meta.env.VITE_API_URL || ''}/api/upload/voice-samples/${clientId}/${encodeURIComponent(filename)}`;

        const response = await fetch(url, {
          method: 'POST',
          body: blob,
          headers: { 'Content-Type': blob.type },
          credentials: 'include',
        });

        if (response.ok) {
          const { r2Key } = await response.json();
          sendVoiceSample(r2Key, undefined, blob.size);
        } else {
          console.error('Voice upload failed:', response.status, await response.text());
        }
      } catch (e) {
        console.error('Voice upload failed:', e);
      }
    };
    uploadVoice();
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1419] text-[#E7E9EA]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1D9BF0]" />
          <p>Connecting to Brand DNA Agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F1419] text-[#E7E9EA]">
      {/* Header */}
      <header className="flex-none px-4 py-3 border-b border-[#2A3038] bg-[#1A1F26]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Brand DNA Discovery</h1>
            {clientName && <p className="text-sm text-[#8B98A5]">{clientName}</p>}
          </div>
          {sessionState && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[#2A3038] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1D9BF0] transition-all duration-500"
                  style={{ width: `${sessionState.progress}%` }}
                />
              </div>
              <span className="text-xs text-[#8B98A5]">{sessionState.progress}%</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSelection={sendSelection}
              onAction={sendAction}
              onVoiceComplete={handleVoiceComplete}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Show based on current step */}
      {sessionState?.currentStep !== 'complete' && isConnected && (
        <div className="flex-none px-4 py-4 border-t border-[#2A3038] bg-[#1A1F26]">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                rows={1}
                className="flex-1 bg-[#0F1419] border border-[#2A3038] rounded-xl px-4 py-3 text-[#E7E9EA] resize-none focus:outline-none focus:border-[#1D9BF0]"
              />
              <button
                onClick={handleSubmitText}
                disabled={!inputText.trim()}
                className="p-3 bg-[#1D9BF0] rounded-full disabled:opacity-50 hover:bg-[#1A8CD8] transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && !isConnecting && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-[#F4212E] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <span>Disconnected</span>
            <button
              onClick={() => window.location.reload()}
              className="underline hover:no-underline"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ConversationMessage;
  onSelection: (type: string, selection: string | string[]) => void;
  onAction: (action: string, data?: unknown) => void;
  onVoiceComplete: (blob: Blob) => void;
}

function MessageBubble({ message, onSelection, onAction, onVoiceComplete }: MessageBubbleProps) {
  const { role, component } = message;

  // User messages
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-[#1D9BF0] text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
          {component.props.content as string}
        </div>
      </div>
    );
  }

  // Agent messages - render based on component type
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <ComponentRenderer
          component={component}
          onSelection={onSelection}
          onAction={onAction}
          onVoiceComplete={onVoiceComplete}
        />
      </div>
    </div>
  );
}

interface ComponentRendererProps {
  component: AgentComponent;
  onSelection: (type: string, selection: string | string[]) => void;
  onAction: (action: string, data?: unknown) => void;
  onVoiceComplete: (blob: Blob) => void;
}

function ComponentRenderer({
  component,
  onSelection,
  onAction,
  onVoiceComplete,
}: ComponentRendererProps) {
  const { type, props } = component;

  switch (type) {
    case 'TextMessage':
      return (
        <div
          className={`px-4 py-3 rounded-2xl rounded-tl-sm ${
            props.variant === 'success'
              ? 'bg-[#00D26A]/20 border border-[#00D26A]/30'
              : 'bg-[#1A1F26] border border-[#2A3038]'
          }`}
        >
          <div className="whitespace-pre-wrap text-[#E7E9EA]">
            {(props.content as string).split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </div>
        </div>
      );

    case 'ButtonChoice':
      return (
        <div className="space-y-3">
          <p className="text-[#8B98A5] text-sm">{props.prompt as string}</p>
          <div className="flex flex-col gap-2">
            {(props.choices as Array<{ id: string; label: string; description: string; icon?: string }>).map(
              (choice) => (
                <button
                  key={choice.id}
                  onClick={() => onSelection('path', choice.id)}
                  className="flex items-center gap-3 p-4 bg-[#1A1F26] border border-[#2A3038] rounded-xl hover:border-[#1D9BF0] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1D9BF0]/20 flex items-center justify-center">
                    {choice.icon === 'sparkles' ? (
                      <Sparkles className="w-5 h-5 text-[#1D9BF0]" />
                    ) : (
                      <Zap className="w-5 h-5 text-[#FFD700]" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-[#E7E9EA]">{choice.label}</div>
                    <div className="text-sm text-[#8B98A5]">{choice.description}</div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      );

    case 'VoiceRecorder':
      return (
        <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-6">
          <p className="text-[#E7E9EA] mb-4">{props.prompt as string}</p>
          <VoiceRecorder
            onComplete={onVoiceComplete}
            onError={(err) => console.error(err)}
            maxDuration={props.maxDuration as number || 120}
          />
          {props.skipOption && (
            <button
              onClick={() => onAction('skip_voice')}
              className="mt-4 text-sm text-[#1D9BF0] hover:underline"
            >
              {(props.skipText as string) || "I'd rather type"}
            </button>
          )}
        </div>
      );

    case 'QuestionCard':
      return <QuestionCardComponent {...(props as QuestionCardProps)} onAction={onAction} />;

    case 'PlatformSelector':
      return <PlatformSelectorComponent {...(props as PlatformSelectorProps)} onSelection={onSelection} />;

    case 'PillarProposal':
      return <PillarProposalComponent {...(props as PillarProposalProps)} onAction={onAction} />;

    case 'BrandDNAReport':
      return <BrandDNAReportComponent {...(props as BrandDNAReportProps)} onAction={onAction} />;

    case 'ProgressIndicator':
      return (
        <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8B98A5]">Step: {props.currentStep as string}</span>
            <span className="text-sm text-[#1D9BF0]">{props.progress as number}%</span>
          </div>
          <div className="w-full h-2 bg-[#2A3038] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D9BF0] transition-all duration-500"
              style={{ width: `${props.progress as number}%` }}
            />
          </div>
        </div>
      );

    case 'Error':
      return (
        <div className="bg-[#F4212E]/20 border border-[#F4212E]/30 rounded-xl p-4">
          <p className="text-[#F4212E]">{props.message as string}</p>
        </div>
      );

    default:
      return (
        <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-4">
          <pre className="text-xs text-[#8B98A5]">{JSON.stringify(props, null, 2)}</pre>
        </div>
      );
  }
}

// Sub-components

interface QuestionCardProps {
  question: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  questionIndex?: number;
  totalQuestions?: number;
  skipOption?: boolean;
}

function QuestionCardComponent({
  question,
  placeholder,
  maxLength,
  questionIndex,
  totalQuestions,
  skipOption,
  onAction,
}: QuestionCardProps & { onAction: (action: string, data?: unknown) => void }) {
  // This is rendered as static text - actual input is handled by the main input area
  return (
    <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-4">
      {questionIndex && totalQuestions && (
        <div className="text-xs text-[#8B98A5] mb-2">
          Question {questionIndex} of {totalQuestions}
        </div>
      )}
      <p className="text-[#E7E9EA]">{question}</p>
      {placeholder && <p className="text-sm text-[#8B98A5] mt-2 italic">{placeholder}</p>}
      {skipOption && (
        <button
          onClick={() => onAction('next_question')}
          className="mt-3 text-sm text-[#1D9BF0] hover:underline"
        >
          Skip this question
        </button>
      )}
    </div>
  );
}

interface PlatformSelectorProps {
  prompt: string;
  allPlatforms: Array<{ id: string; name: string; bestFor: string; rationale?: string }>;
  recommended?: Array<{ id: string; name: string; bestFor: string; rationale?: string }>;
  minSelection?: number;
  maxSelection?: number;
}

function PlatformSelectorComponent({
  prompt,
  allPlatforms,
  recommended,
  minSelection = 2,
  maxSelection = 4,
  onSelection,
}: PlatformSelectorProps & { onSelection: (type: string, selection: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(
    recommended?.slice(0, minSelection).map(p => p.id) || []
  );

  const togglePlatform = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      if (prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const canSubmit = selected.length >= minSelection && selected.length <= maxSelection;

  return (
    <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-4">
      <p className="text-[#E7E9EA] mb-4">{prompt}</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {allPlatforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`p-3 rounded-lg border transition-all text-left ${
              selected.includes(platform.id)
                ? 'border-[#1D9BF0] bg-[#1D9BF0]/20'
                : 'border-[#2A3038] hover:border-[#3A4048]'
            }`}
          >
            <div className="font-medium text-[#E7E9EA] text-sm">{platform.name}</div>
            <div className="text-xs text-[#8B98A5] mt-1">{platform.bestFor}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelection('platforms', selected)}
        disabled={!canSubmit}
        className="w-full py-3 bg-[#1D9BF0] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#1A8CD8] transition-colors"
      >
        Continue with {selected.length} platforms
      </button>
    </div>
  );
}

interface PillarProposalProps {
  prompt: string;
  pillars: Array<{
    id: string;
    title: string;
    description: string;
    rationale: string;
    type?: string;
  }>;
  allowEdit?: boolean;
  allowRegenerate?: boolean;
}

function PillarProposalComponent({
  prompt,
  pillars,
  allowRegenerate,
  onAction,
}: PillarProposalProps & { onAction: (action: string, data?: unknown) => void }) {
  return (
    <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-4">
      <p className="text-[#E7E9EA] mb-4">{prompt}</p>
      <div className="space-y-3 mb-4">
        {pillars.map(pillar => (
          <div key={pillar.id} className="p-3 bg-[#0F1419] rounded-lg border border-[#2A3038]">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-[#E7E9EA]">{pillar.title}</h4>
                <p className="text-sm text-[#8B98A5] mt-1">{pillar.description}</p>
                <p className="text-xs text-[#1D9BF0] mt-2">{pillar.rationale}</p>
              </div>
              {allowRegenerate && (
                <button
                  onClick={() => onAction('regenerate', { pillarId: pillar.id })}
                  className="p-2 text-[#8B98A5] hover:text-[#1D9BF0] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onAction('approve_all')}
        className="w-full py-3 bg-[#00D26A] text-white rounded-lg font-medium hover:bg-[#00BA5F] transition-colors flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Approve All Pillars
      </button>
    </div>
  );
}

interface BrandDNAReportProps {
  personality: string;
  tone: string;
  platforms: string[];
  pillars: Array<{ title: string; description: string }>;
  audienceSnapshot: {
    demographics: string;
    painPoints: string;
    aspirations: string;
  };
  strengthScore: number;
  actions: Array<{ id: string; label: string; primary?: boolean }>;
}

function BrandDNAReportComponent({
  personality,
  tone,
  platforms,
  pillars,
  audienceSnapshot,
  strengthScore,
  actions,
  onAction,
}: BrandDNAReportProps & { onAction: (action: string, data?: unknown) => void }) {
  return (
    <div className="bg-[#1A1F26] border border-[#2A3038] rounded-xl p-6">
      <h3 className="text-xl font-semibold text-[#E7E9EA] mb-4">Your Brand DNA Report</h3>

      {/* Strength Score */}
      <div className="bg-[#0F1419] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#8B98A5]">Brand DNA Strength</span>
          <span className="text-2xl font-bold text-[#1D9BF0]">{strengthScore}%</span>
        </div>
        <div className="w-full h-3 bg-[#2A3038] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1D9BF0] to-[#00D26A] transition-all"
            style={{ width: `${strengthScore}%` }}
          />
        </div>
      </div>

      {/* Personality */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[#8B98A5] mb-1">Personality</h4>
        <p className="text-[#E7E9EA]">{personality}</p>
        <p className="text-sm text-[#8B98A5] mt-1">Tone: {tone}</p>
      </div>

      {/* Platforms */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[#8B98A5] mb-2">Platforms</h4>
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <span key={platform} className="px-3 py-1 bg-[#1D9BF0]/20 text-[#1D9BF0] rounded-full text-sm">
              {platform}
            </span>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[#8B98A5] mb-2">Content Pillars</h4>
        <div className="space-y-2">
          {pillars.map((pillar, i) => (
            <div key={i} className="p-2 bg-[#0F1419] rounded">
              <span className="font-medium text-[#E7E9EA]">{pillar.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(`${action.id}_session`)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              action.primary
                ? 'bg-[#00D26A] text-white hover:bg-[#00BA5F]'
                : 'bg-[#2A3038] text-[#E7E9EA] hover:bg-[#3A4048]'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
