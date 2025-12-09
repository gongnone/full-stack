import { useEffect, useState, useRef, useCallback } from 'react';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type UseAgentSocketReturn = {
    messages: Message[];
    isConnected: boolean;
    sendMessage: (message: string) => void;
};

export function useAgentSocket(sessionId: string): UseAgentSocketReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        // Determine WebSocket URL based on current environment
        // Assuming the backend is on the same host for simpler path, or configured via env
        // For local development, we might need a specific port. 
        // For now, I'll assume /api/ws endpoint on the current origin.
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // Append sessionId to query params for the backend to identify the session
        const wsUrl = `${protocol}//${host}/api/ws?sessionId=${sessionId}`;

        console.log('Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
                }
                // Handle other message types like 'status', 'error' etc if needed
            } catch (e) {
                console.error('Failed to parse websocket message:', e);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
        };

        return () => {
            ws.close();
            socketRef.current = null;
        };
    }, [sessionId]);

    const sendMessage = useCallback((content: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Optimistic update
            setMessages((prev) => [...prev, { role: 'user', content }]);
            socketRef.current.send(JSON.stringify({ type: 'message', content }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }, []);

    return { messages, isConnected, sendMessage };
}
