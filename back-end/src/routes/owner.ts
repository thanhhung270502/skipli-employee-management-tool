import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../services/firebase';
import { sendOtpSms } from '../services/sms';
import { sendEmployeeInviteEmail } from '../services/email';
import { generateToken, authenticateToken, requireOwner } from '../middleware/auth';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp';
import { AuthRequest, EmployeePublic } from '../types';

const router = Router();

// ─────────────────────────────────────────────────────────────────
// POST /api/owner/create-new-access-code
// ─────────────────────────────────────────────────────────────────
router.post('/create-new-access-code', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber } = req.body as { phoneNumber?: string };

    if (!phoneNumber?.trim()) {
      res.status(400).json({ success: false, message: 'phoneNumber is required' });
      return;
    }

    const otp = generateOtp();
    const expiry = getOtpExpiry();
    const db = getDb();

    await db.collection('owners').doc(phoneNumber).set(
      { phoneNumber, accessCode: otp, accessCodeExpiry: expiry, updatedAt: new Date() },
      { merge: true }
    );

    await sendOtpSms(phoneNumber, otp);

    res.json({ success: true, message: 'Access code sent via SMS' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/owner/validate-access-code
// ─────────────────────────────────────────────────────────────────
router.post('/validate-access-code', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, accessCode } = req.body as { phoneNumber?: string; accessCode?: string };

    if (!phoneNumber || !accessCode) {
      res.status(400).json({ success: false, message: 'phoneNumber and accessCode are required' });
      return;
    }

    const db = getDb();
    const ownerDoc = await db.collection('owners').doc(phoneNumber).get();

    if (!ownerDoc.exists) {
      res.status(404).json({ success: false, message: 'Phone number not found' });
      return;
    }

    const ownerData = ownerDoc.data()!;

    if (!ownerData.accessCode) {
      res.status(400).json({ success: false, message: 'No access code found. Request a new one.' });
      return;
    }
    if (ownerData.accessCode !== accessCode) {
      res.status(400).json({ success: false, message: 'Invalid access code' });
      return;
    }
    if (isOtpExpired(ownerData.accessCodeExpiry)) {
      res.status(400).json({ success: false, message: 'Access code expired. Request a new one.' });
      return;
    }

    // Clear code after successful validation
    await db.collection('owners').doc(phoneNumber).update({ accessCode: '', accessCodeExpiry: null });

    const token = generateToken({ phoneNumber, role: 'owner' });

    res.json({ success: true, token, role: 'owner', phoneNumber });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/owner/employees/:employeeId
// ─────────────────────────────────────────────────────────────────
router.get('/employees/:employeeId', authenticateToken, requireOwner, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      res.status(400).json({ success: false, message: 'employeeId is required' });
      return;
    }

    const db = getDb();
    const doc = await db.collection('employees').doc(employeeId).get();

    if (!doc.exists) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const { passwordHash, inviteToken, ...safeEmployee } = doc.data()!;

    res.json({ success: true, employee: { id: doc.id, ...safeEmployee } as EmployeePublic });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/owner/employees
// ─────────────────────────────────────────────────────────────────
router.get('/employees', authenticateToken, requireOwner, async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDb();
    const snapshot = await db.collection('employees').orderBy('createdAt', 'desc').get();

    const employees: EmployeePublic[] = snapshot.docs.map((doc) => {
      const { passwordHash, inviteToken, ...safe } = doc.data();
      return { id: doc.id, ...safe } as EmployeePublic;
    });

    res.json({ success: true, employees });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/owner/employees
// ─────────────────────────────────────────────────────────────────
router.post('/employees', authenticateToken, requireOwner, async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, department, phone, role } = _req.body as {
      name?: string;
      email?: string;
      department?: string;
      phone?: string;
      role?: string;
    };

    if (!name || !email || !department) {
      res.status(400).json({ success: false, message: 'name, email, and department are required' });
      return;
    }

    const db = getDb();

    // Check email uniqueness
    const existing = await db.collection('employees').where('email', '==', email).get();
    if (!existing.empty) {
      res.status(409).json({ success: false, message: 'An employee with this email already exists' });
      return;
    }

    const employeeId = uuidv4();
    const inviteToken = uuidv4();
    const inviteExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const employee = {
      name,
      email,
      department,
      phone: phone ?? '',
      role: role ?? 'Employee',
      inviteToken,
      inviteExpiry,
      isSetup: false,
      username: null,
      passwordHash: null,
      workSchedule: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('employees').doc(employeeId).set(employee);
    await sendEmployeeInviteEmail({ to: email, name, inviteToken });

    res.status(201).json({ success: true, employeeId, message: 'Employee created and invite email sent' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/owner/employees/:employeeId
// ─────────────────────────────────────────────────────────────────
router.delete('/employees/:employeeId', authenticateToken, requireOwner, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      res.status(400).json({ success: false, message: 'employeeId is required' });
      return;
    }

    const db = getDb();
    const doc = await db.collection('employees').doc(employeeId).get();

    if (!doc.exists) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    await db.collection('employees').doc(employeeId).delete();
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/owner/employees/:employeeId
// ─────────────────────────────────────────────────────────────────
router.put('/employees/:employeeId', authenticateToken, requireOwner, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { name, email, phone, department, role, workSchedule } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      department?: string;
      role?: string;
      workSchedule?: object;
    };

    if (!employeeId) {
      res.status(400).json({ success: false, message: 'employeeId is required' });
      return;
    }

    const db = getDb();
    const doc = await db.collection('employees').doc(employeeId).get();
    if (!doc.exists) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (role !== undefined) updates.role = role;
    if (workSchedule !== undefined) updates.workSchedule = workSchedule;

    await db.collection('employees').doc(employeeId).update(updates);
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/owner/tasks
// ─────────────────────────────────────────────────────────────────
router.post('/tasks', authenticateToken, requireOwner, async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, assignedTo, dueDate } = _req.body as {
      title?: string;
      description?: string;
      assignedTo?: string;
      dueDate?: string;
    };

    if (!title || !assignedTo) {
      res.status(400).json({ success: false, message: 'title and assignedTo are required' });
      return;
    }

    const db = getDb();
    const empDoc = await db.collection('employees').doc(assignedTo).get();

    if (!empDoc.exists) {
      res.status(404).json({ success: false, message: 'Assigned employee not found' });
      return;
    }

    const taskId = uuidv4();
    const task = {
      title,
      description: description ?? '',
      assignedTo,
      assignedToName: empDoc.data()!.name as string,
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('tasks').doc(taskId).set(task);
    res.status(201).json({ success: true, taskId, task: { id: taskId, ...task } });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/owner/tasks
// ─────────────────────────────────────────────────────────────────
router.get('/tasks', authenticateToken, requireOwner, async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDb();
    const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

export default router;
