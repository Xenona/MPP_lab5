import { Server as IOServer } from 'socket.io';
import http from 'http';

let io: IOServer | null = null;
let onlineUsers = 0;

export function initSocket(server: http.Server) {
    io = new IOServer(server, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        onlineUsers++;
        io?.emit('metrics:users', {count: onlineUsers});


        socket.on('disconnect', () => {
            onlineUsers = Math.max(0, onlineUsers - 1);
            io?.emit('metrics:users', {count: onlineUsers});
        });
    });

    return io;
}


export function emit(event: string, payload: any) {
    if (!io) return;
    io.emit(event, payload);
}

export function getOnlineCount() {
    return onlineUsers;
}

export default {initSocket, emit, getOnlineCount};