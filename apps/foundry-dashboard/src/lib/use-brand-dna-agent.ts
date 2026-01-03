/**
 * WebSocket hook for BrandDNA Agent conversation
 *
 * Connects to the BrandDNAAgent Durable Object for real-time
 * conversational brand discovery.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Response component types from the agent
export interface AgentComponent {
  type:
    | 'TextMessage'
    | 'VoiceRecorder'
    | 'QuestionCard'
    | 'ProgressIndicator'
    | 'PlatformSelector'
    | 'PillarProposal'
    | 'PersonaCard'
    | 'BrandDNAReport'
    | 'ButtonChoice'
    | 'Error'
    | 'HistoryBatch';
  props: Record<string, unknown>;
}

export interface AgentMessage {
  component: AgentComponent;
  sessionState?: {
    currentStep: string;
    progress: number;
  };
  requestId?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'agent' | 'user';
  component: AgentComponent;
  timestamp: number;
}

interface UseBrandDNAAgentOptions {
  clientId: string;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface UseBrandDNAAgentReturn {
  isConnected: boolean;
  isConnecting: boolean;
  messages: ConversationMessage[];
  sessionState: { currentStep: string; progress: number } | null;
  sendTextInput: (text: string) => void;
  sendVoiceSample: (r2Key: string, transcript?: string, durationMs?: number) => void;
  sendSelection: (type: string, selection: string | string[]) => void;
  sendAction: (action: string, data?: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useBrandDNAAgent({
  clientId,
  onError,
  onConnected,
  onDisconnected,
}: UseBrandDNAAgentOptions): UseBrandDNAAgentReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sessionState, setSessionState] = useState<{ currentStep: string; progress: number } | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/brand-dna/${clientId}`;
  }, [clientId]);

  const addMessage = useCallback((role: 'agent' | 'user', component: AgentComponent) => {
    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      role,
      component,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      // Handle pong
      if (data.type === 'pong') {
        return;
      }

      // Handle agent response
      if (data.component) {
        const agentMessage = data as AgentMessage;

        // Handle history batch specially
        if (agentMessage.component.type === 'HistoryBatch') {
          const historyMessages = agentMessage.component.props.messages as Array<{
            role: string;
            content: string;
            componentType: string;
            createdAt: number;
          }>;

          historyMessages.forEach(msg => {
            addMessage(msg.role as 'agent' | 'user', {
              type: msg.componentType as AgentComponent['type'] || 'TextMessage',
              props: { content: msg.content, variant: msg.role },
            });
          });
        } else {
          addMessage('agent', agentMessage.component);
        }

        // Update session state
        if (agentMessage.sessionState) {
          setSessionState(agentMessage.sessionState);
        }
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  }, [addMessage]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    const url = getWebSocketUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0; // Reset reconnect counter on successful connection
      onConnected?.();

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnected?.();

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      // Attempt reconnect with exponential backoff, max 5 attempts
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current === ws) {
            connect();
          }
        }, delay);
      } else {
        console.error('[WS] Max reconnection attempts reached');
        onError?.('Connection failed after multiple attempts. Please refresh the page.');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.('Connection error. Retrying...');
    };

    wsRef.current = ws;
  }, [getWebSocketUrl, handleMessage, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendTextInput = useCallback((text: string) => {
    addMessage('user', { type: 'TextMessage', props: { content: text, variant: 'user' } });
    sendMessage({
      type: 'text_input',
      payload: { text },
      requestId: crypto.randomUUID(),
    });
  }, [addMessage, sendMessage]);

  const sendVoiceSample = useCallback((r2Key: string, transcript?: string, durationMs?: number) => {
    addMessage('user', {
      type: 'TextMessage',
      props: { content: transcript || '[Voice recording sent]', variant: 'user' }
    });
    sendMessage({
      type: 'voice_sample',
      payload: { r2Key, transcript, durationMs },
      requestId: crypto.randomUUID(),
    });
  }, [addMessage, sendMessage]);

  const sendSelection = useCallback((type: string, selection: string | string[]) => {
    sendMessage({
      type: 'selection',
      payload: { type, selection },
      requestId: crypto.randomUUID(),
    });
  }, [sendMessage]);

  const sendAction = useCallback((action: string, data?: unknown) => {
    sendMessage({
      type: 'action',
      payload: { action, data },
      requestId: crypto.randomUUID(),
    });
  }, [sendMessage]);

  // Connect on mount - use ref to prevent Strict Mode double-connection issues
  useEffect(() => {
    // Small delay to ensure component is fully mounted and avoid React Strict Mode race
    const timeoutId = setTimeout(() => {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]); // Only reconnect when clientId changes

  return {
    isConnected,
    isConnecting,
    messages,
    sessionState,
    sendTextInput,
    sendVoiceSample,
    sendSelection,
    sendAction,
    connect,
    disconnect,
  };
}
