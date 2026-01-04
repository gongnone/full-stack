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

// Centralized constants for memory management
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_MESSAGES = 500; // Prevent memory exhaustion during adversarial testing
const MAX_HISTORY_BATCH = 100; // Limit history batch processing to prevent UI freeze

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
  const isUnmountedRef = useRef(false); // Track unmount to prevent state updates
  const pendingMessagesRef = useRef<unknown[]>([]); // Queue for messages while connecting

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/brand-dna/${clientId}`;
  }, [clientId]);

  const addMessage = useCallback((role: 'agent' | 'user', component: AgentComponent) => {
    if (isUnmountedRef.current) return; // Prevent state updates after unmount

    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      role,
      component,
      timestamp: Date.now(),
    };
    setMessages(prev => {
      // Prevent unbounded growth - keep only last MAX_MESSAGES
      const updated = [...prev, message];
      if (updated.length > MAX_MESSAGES) {
        return updated.slice(-MAX_MESSAGES);
      }
      return updated;
    });
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (isUnmountedRef.current) return; // Prevent processing after unmount

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

          // Skip complex components that need full props (they'll be re-sent)
          const complexTypes = ['PlatformSelector', 'PillarProposal', 'BrandDNAReport'];

          // Limit history batch processing to prevent UI freeze
          const limitedHistory = historyMessages.slice(-MAX_HISTORY_BATCH);

          limitedHistory.forEach(msg => {
            // Skip complex components - they'll be re-sent with full props
            if (complexTypes.includes(msg.componentType)) {
              return;
            }

            addMessage(msg.role as 'agent' | 'user', {
              type: msg.componentType as AgentComponent['type'] || 'TextMessage',
              props: { content: msg.content, variant: msg.role },
            });
          });
        } else {
          addMessage('agent', agentMessage.component);
        }

        // Update session state
        if (agentMessage.sessionState && !isUnmountedRef.current) {
          setSessionState(agentMessage.sessionState);
        }
      }
    } catch (e) {
      console.error('[useBrandDNAAgent] Failed to parse WebSocket message:', e);
    }
  }, [addMessage]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Don't reconnect if unmounted
    if (isUnmountedRef.current) {
      return;
    }

    // Clear any pending reconnect timeout before creating new connection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnecting(true);
    const url = getWebSocketUrl();
    const ws = new WebSocket(url);
    let connectionClosed = false; // Track if this specific connection closed

    ws.onopen = () => {
      if (isUnmountedRef.current || connectionClosed) return;

      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0; // Reset reconnect counter on successful connection
      onConnected?.();

      // Flush any pending messages that were queued while connecting
      const pending = pendingMessagesRef.current;
      pendingMessagesRef.current = [];
      for (const msg of pending) {
        try {
          ws.send(JSON.stringify(msg));
        } catch (e) {
          console.error('[useBrandDNAAgent] Failed to send queued message:', e);
        }
      }

      // Start ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && !isUnmountedRef.current) {
          try {
            ws.send(JSON.stringify({ type: 'ping' }));
          } catch (e) {
            console.error('[useBrandDNAAgent] Ping failed:', e);
          }
        }
      }, 30000);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      connectionClosed = true;

      // Clear pending messages queue - they won't be sent on this connection
      pendingMessagesRef.current = [];

      if (isUnmountedRef.current) return;

      setIsConnected(false);
      setIsConnecting(false);
      onDisconnected?.();

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only attempt reconnect if this is still the current WebSocket instance
      // and we haven't exceeded max attempts
      if (wsRef.current === ws && !isUnmountedRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        console.log(`[useBrandDNAAgent] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

        // Clear any existing timeout before setting new one
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            connect();
          }
        }, delay);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error('[useBrandDNAAgent] Max reconnection attempts reached');
        onError?.('Connection failed after multiple attempts. Please refresh the page.');
      }
    };

    ws.onerror = (error) => {
      console.error('[useBrandDNAAgent] WebSocket error:', error);
      if (!isUnmountedRef.current) {
        onError?.('Connection error. Retrying...');
      }
    };

    wsRef.current = ws;
  }, [getWebSocketUrl, handleMessage, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    // Clear all pending operations
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      // Prevent reconnection attempts after explicit disconnect
      const ws = wsRef.current;
      wsRef.current = null;
      try {
        ws.close(1000, 'Client disconnect'); // Normal closure
      } catch (e) {
        console.error('[useBrandDNAAgent] Error during disconnect:', e);
      }
    }
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    const ws = wsRef.current;
    if (!ws || isUnmountedRef.current) return;

    // Only send if connection is open
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[useBrandDNAAgent] Failed to send message:', error);
      }
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // Queue message - will be flushed when connection opens
      // This avoids adding multiple event listeners and handles connection failures gracefully
      pendingMessagesRef.current.push(message);
    }
    // If CLOSING or CLOSED, message is dropped (connection will reconnect)
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
    isUnmountedRef.current = false;

    // Small delay to ensure component is fully mounted and avoid React Strict Mode race
    const timeoutId = setTimeout(() => {
      if (!isUnmountedRef.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
        connect();
      }
    }, 100);

    return () => {
      isUnmountedRef.current = true;
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
