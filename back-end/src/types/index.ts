import { Request } from 'express';

// ─── Auth Types ──────────────────────────────────────────────────
export interface JwtOwnerPayload {
  phoneNumber: string;
  role: 'owner';
  iat?: number;
  exp?: number;
}

export interface JwtEmployeePayload {
  employeeId: string;
  email: string;
  role: 'employee';
  iat?: number;
  exp?: number;
}

export type JwtPayload = JwtOwnerPayload | JwtEmployeePayload;

// Extend Express Request with user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Firestore Models ─────────────────────────────────────────────
export interface Owner {
  phoneNumber: string;
  accessCode: string;
  accessCodeExpiry: Date | null;
  updatedAt: Date;
}

export interface Employee {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  username: string | null;
  passwordHash: string | null;
  inviteToken: string | null;
  inviteExpiry: Date | null;
  isSetup: boolean;
  accessCode?: string;
  accessCodeExpiry?: Date | null;
  workSchedule?: WorkSchedule | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'done';
  dueDate: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'employee';
  text: string;
  timestamp: Date;
}

export interface WorkSchedule {
  days: string[];
  startTime: string;
  endTime: string;
}

// ─── API Response Types ───────────────────────────────────────────
export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface EmployeePublic extends Omit<Employee, 'passwordHash' | 'inviteToken'> {
  id: string;
}
