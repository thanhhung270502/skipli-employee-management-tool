import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { initializeFirebase } from './common/services/firebase';
import { errorHandler, notFound } from './common/middleware/errorHandler';

import ownerAuthRouter from './modules/owner-auth';
import employeeAuthRouter from './modules/employee-auth';
import { ownerEmployeeRouter, profileRouter } from './modules/employee';
import { ownerTaskRouter, employeeTaskRouter } from './modules/task';
import chatRouter, { initializeChatSocket } from './modules/chat';

initializeFirebase();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeChatSocket(io);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/owner/create-new-access-code', otpLimiter);
app.use('/api/employee/login-email', otpLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Skipli API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

app.use('/api/owner', ownerAuthRouter);
app.use('/api/employee', employeeAuthRouter);
app.use('/api/owner/employees', ownerEmployeeRouter);
app.use('/api/employee', profileRouter);
app.use('/api/owner/tasks', ownerTaskRouter);
app.use('/api/employee/tasks', employeeTaskRouter);
app.use('/api/chat', chatRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT ?? '5000', 10);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Skipli Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

export { app, httpServer };
