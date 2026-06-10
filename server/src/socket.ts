import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { TokenPayload } from './types';

let io: Server | null = null;

const parseCookie = (cookieString?: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;
  cookieString.split(';').forEach(pair => {
    const parts = pair.split('=');
    const name = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (name) {
      cookies[name] = decodeURIComponent(val);
    }
  });
  return cookies;
};

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }
  });

  io.use((socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token) {
        token = socket.handshake.query?.token as string;
      }

      if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookie(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const secret = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';
      const decoded = jwt.verify(token, secret) as TokenPayload;
      
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as TokenPayload;
    if (user) {
      const userRoom = `user:${user.userId}`;
      const roleRoom = `role:${user.role}`;

      socket.join(userRoom);
      socket.join(roleRoom);

      console.log(`🔌 Socket connected: User ${user.email} (${user.role}) - ID: ${socket.id} joined rooms [${userRoom}, ${roleRoom}]`);

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: User ${user.email} - ID: ${socket.id}`);
      });
    }
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket first.');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToRole = (role: Role, event: string, data: any) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const broadcast = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
