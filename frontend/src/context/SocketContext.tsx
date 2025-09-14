import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import socket from '../socket';

export interface Message {
    id: string;
    text: string;
    createdAt: number;
    exiting?: boolean;
    variant?: 'info' | 'success' | 'warn';
}

interface SocketContextValue {
    onlineCount: number;
    messages: Message[];
    removeMessage: (id: string) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3000;
const EXIT_ANIM_MS = 300; 

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        function pushMessage(text: string, variant: Message['variant'] = 'info', duration = DEFAULT_DURATION) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const msg: Message = { id, text, createdAt: Date.now(), variant };
            setMessages(prev => [msg, ...prev].slice(0, 10));

            const t = setTimeout(() => {
                startRemoveMessage(id);
            }, duration);
            dismissTimers.current.set(id, t);
        }

        function startRemoveMessage(id: string) {
            setMessages(prev => {
                if (!prev.some(m => m.id === id && !m.exiting)) return prev;
                return prev.map(m => (m.id === id ? { ...m, exiting: true } : m));
            });

            const rt = setTimeout(() => {
                setMessages(prev => prev.filter(m => m.id !== id));
                dismissTimers.current.delete(id);
                removeTimers.current.delete(id);
            }, EXIT_ANIM_MS);

            removeTimers.current.set(id, rt);
        }

        socket.on('connect', () => {
            console.log('socket connected', socket.id);
        });

        socket.on('metrics:users', (payload: { count: number }) => {
            setOnlineCount(payload.count ?? 0);
        });

        socket.on('user:login', (p: any) => {
            pushMessage(`User signed in: ${p.username ?? 'unknown'}`, 'success');
        });

        socket.on('user:logout', (p: any) => {
            pushMessage(`User signed out: ${p.username ?? 'unknown'}`, 'info');
        });

        socket.on('task:created', (p: any) => {
            pushMessage(`New task: ${p.title} — by ${p.username ?? 'someone'}`, 'info');
        });

        return () => {
            socket.off('connect');
            socket.off('metrics:users');
            socket.off('user:login');
            socket.off('user:logout');
            socket.off('task:created');

            dismissTimers.current.forEach(t => clearTimeout(t));
            removeTimers.current.forEach(t => clearTimeout(t));
            dismissTimers.current.clear();
            removeTimers.current.clear();
        };
    }, []);

    const removeMessage = (id: string) => {
        const t = dismissTimers.current.get(id);
        if (t) { clearTimeout(t); dismissTimers.current.delete(id); }
        setMessages(prev => prev.map(m => (m.id === id ? { ...m, exiting: true } : m)));
        const rt = setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== id));
            removeTimers.current.delete(id);
        }, EXIT_ANIM_MS);
        removeTimers.current.set(id, rt);
    };

    return (
        <SocketContext.Provider value={{ onlineCount, messages, removeMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
    return ctx;
}
