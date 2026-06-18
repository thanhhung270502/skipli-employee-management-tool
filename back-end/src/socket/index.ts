import { Server, Socket } from 'socket.io';
import { getDb } from '../services/firebase';
import { ChatMessage } from '../types';

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  role: 'owner' | 'employee';
  name: string;
}

interface SendMessagePayload {
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'employee';
  text: string;
}

interface TypingPayload {
  roomId: string;
  senderName?: string;
}

interface OnlineUser {
  userId: string;
  role: 'owner' | 'employee';
  name: string;
  roomId: string;
}

/**
 * Initialize Socket.io handlers for real-time chat
 */
export const initializeSocket = (io: Server): void => {
  // Track online users: Map<socketId, OnlineUser>
  const onlineUsers = new Map<string, OnlineUser>();

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Join a chat room ───────────────────────────────────────
    socket.on('join_room', ({ roomId, userId, role, name }: JoinRoomPayload) => {
      socket.join(roomId);
      onlineUsers.set(socket.id, { userId, role, name, roomId });

      console.log(`👤 ${name} (${role}) joined room: ${roomId}`);

      socket.to(roomId).emit('user_joined', { userId, role, name });
      socket.emit('room_joined', { roomId });
    });

    // ─── Send a message ─────────────────────────────────────────
    socket.on('send_message', async ({ roomId, senderId, senderName, senderRole, text }: SendMessagePayload) => {
      if (!roomId || !text?.trim()) return;

      const messageData: ChatMessage = {
        senderId,
        senderName,
        senderRole,
        text: text.trim(),
        timestamp: new Date(),
      };

      try {
        const db = getDb();
        const docRef = await db
          .collection('messages')
          .doc(roomId)
          .collection('chats')
          .add(messageData);

        const message: ChatMessage & { id: string } = { id: docRef.id, ...messageData };

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('receive_message', message);
      } catch (error) {
        const err = error as Error;
        console.error('❌ Failed to save message:', err.message);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing indicators ──────────────────────────────────────
    socket.on('typing_start', ({ roomId, senderName }: TypingPayload) => {
      socket.to(roomId).emit('user_typing', { senderName });
    });

    socket.on('typing_stop', ({ roomId }: TypingPayload) => {
      socket.to(roomId).emit('user_stopped_typing');
    });

    // ─── Disconnect ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.to(user.roomId).emit('user_left', { userId: user.userId, name: user.name });
        onlineUsers.delete(socket.id);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
