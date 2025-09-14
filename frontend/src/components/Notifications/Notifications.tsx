import React from 'react';
import './Notifications.css'
import { useSocket } from '../../context/SocketContext.tsx';

const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Notifications: React.FC = () => {
    const { messages, removeMessage } = useSocket();

    return (
        <div className="notifications-wrapper" aria-live="polite" aria-atomic="true">
            <div className="notifications">
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={`toast ${m.variant ?? 'info'} ${m.exiting ? 'toast-exit' : 'toast-enter'}`}
                        role="status"
                    >
                        <div className="toast-left">
                            <div className="toast-title">{m.variant === 'success' ? 'Success' : 'Notice'}</div>
                            <div className="toast-text">{m.text}</div>
                        </div>

                        <div className="toast-right">
                            <div className="toast-time">{formatTime(m.createdAt)}</div>
                            <button className="toast-close" onClick={() => removeMessage(m.id)} aria-label="Dismiss">
                                ✕
                            </button>
                        </div>

                        <div className="toast-timer" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
