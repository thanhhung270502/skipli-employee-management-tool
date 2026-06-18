import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { initializeFirebase } from './services/firebase';
import { initializeSocket } from './socket';
import { errorHandler, notFound } from './middleware/errorHandler';

import ownerRoutes from './routes/owner';
import employeeRoutes from './routes/employee';
import chatRoutes from './routes/chat';

// ─── Initialize Firebase ───────────────────────────────────────────
initializeFirebase();

// ─── Express App ───────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);

// ─── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ─────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/owner/create-new-access-code', otpLimiter);
app.use('/api/employee/login-email', otpLimiter);

// ─── Routes ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Skipli API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

app.use('/api/owner', ownerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/chat', chatRoutes);

// ─── Error Handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '5000', 10);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Skipli Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

export { app, httpServer };
