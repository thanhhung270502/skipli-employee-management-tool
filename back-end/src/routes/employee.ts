import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../services/firebase';
import { sendOtpEmail } from '../services/email';
import { generateToken, authenticateToken, requireEmployee } from '../middleware/auth';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp';
import { AuthRequest, JwtEmployeePayload } from '../types';

const router = Router();

// ─────────────────────────────────────────────────────────────────
// POST /api/employee/login-email
// ─────────────────────────────────────────────────────────────────
router.post('/login-email', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    if (!email?.trim()) {
      res.status(400).json({ success: false, message: 'email is required' });
      return;
    }

    const db = getDb();
    const snapshot = await db.collection('employees').where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      res.status(404).json({ success: false, message: 'No employee found with this email' });
      return;
    }

    const employeeDoc = snapshot.docs[0];
    const employee = employeeDoc.data();

    if (!employee.isSetup) {
      res.status(403).json({
        success: false,
        message: 'Account not set up yet. Please check your invite email.',
      });
      return;
    }

    const otp = generateOtp();
    const expiry = getOtpExpiry();

    await employeeDoc.ref.update({ accessCode: otp, accessCodeExpiry: expiry });
    await sendOtpEmail({ to: email, name: employee.name as string, otp });

    res.json({ success: true, message: 'Access code sent to your email' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/employee/validate-access-code
// ─────────────────────────────────────────────────────────────────
router.post('/validate-access-code', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, accessCode } = req.body as { email?: string; accessCode?: string };

    if (!email || !accessCode) {
      res.status(400).json({ success: false, message: 'email and accessCode are required' });
      return;
    }

    const db = getDb();
    const snapshot = await db.collection('employees').where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const employeeDoc = snapshot.docs[0];
    const employee = employeeDoc.data();

    if (!employee.accessCode) {
      res.status(400).json({ success: false, message: 'No access code found. Request a new one.' });
      return;
    }
    if (employee.accessCode !== accessCode) {
      res.status(400).json({ success: false, message: 'Invalid access code' });
      return;
    }
    if (isOtpExpired(employee.accessCodeExpiry)) {
      res.status(400).json({ success: false, message: 'Access code expired. Request a new one.' });
      return;
    }

    await employeeDoc.ref.update({ accessCode: '', accessCodeExpiry: null });

    const payload: Omit<JwtEmployeePayload, 'iat' | 'exp'> = {
      employeeId: employeeDoc.id,
      email,
      role: 'employee',
    };
    const token = generateToken(payload);

    res.json({
      success: true,
      token,
      role: 'employee',
      employee: {
        id: employeeDoc.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/employee/setup-account
// ─────────────────────────────────────────────────────────────────
router.post('/setup-account', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { inviteToken, username, password } = req.body as {
      inviteToken?: string;
      username?: string;
      password?: string;
    };

    if (!inviteToken || !username || !password) {
      res.status(400).json({ success: false, message: 'inviteToken, username, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }

    const db = getDb();
    const snapshot = await db.collection('employees').where('inviteToken', '==', inviteToken).limit(1).get();

    if (snapshot.empty) {
      res.status(400).json({ success: false, message: 'Invalid or expired invite link' });
      return;
    }

    const employeeDoc = snapshot.docs[0];
    const employee = employeeDoc.data();

    const inviteExpiry = isOtpExpired(employee.inviteExpiry);
    if (inviteExpiry) {
      res.status(400).json({ success: false, message: 'Invite link has expired. Please contact your manager.' });
      return;
    }

    if (employee.isSetup as boolean) {
      res.status(400).json({ success: false, message: 'Account already set up. Please log in.' });
      return;
    }

    // Check username uniqueness
    const usernameCheck = await db.collection('employees').where('username', '==', username).limit(1).get();
    if (!usernameCheck.empty) {
      res.status(409).json({ success: false, message: 'Username already taken' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await employeeDoc.ref.update({
      username,
      passwordHash,
      isSetup: true,
      inviteToken: null,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: 'Account setup successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/employee/profile
// ─────────────────────────────────────────────────────────────────
router.get('/profile', authenticateToken, requireEmployee, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as JwtEmployeePayload;
    const db = getDb();
    const doc = await db.collection('employees').doc(user.employeeId).get();

    if (!doc.exists) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const { passwordHash, inviteToken, accessCode, ...safe } = doc.data()!;
    res.json({ success: true, employee: { id: doc.id, ...safe } });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/employee/profile
// ─────────────────────────────────────────────────────────────────
router.put('/profile', authenticateToken, requireEmployee, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as JwtEmployeePayload;
    const { name, phone, email } = req.body as { name?: string; phone?: string; email?: string };

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;

    const db = getDb();
    await db.collection('employees').doc(user.employeeId).update(updates);

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/employee/tasks
// ─────────────────────────────────────────────────────────────────
router.get('/tasks', authenticateToken, requireEmployee, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as JwtEmployeePayload;
    const db = getDb();

    const snapshot = await db
      .collection('tasks')
      .where('assignedTo', '==', user.employeeId)
      .orderBy('createdAt', 'desc')
      .get();

    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/employee/tasks/:taskId/done
// ─────────────────────────────────────────────────────────────────
router.put('/tasks/:taskId/done', authenticateToken, requireEmployee, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as JwtEmployeePayload;
    const { taskId } = req.params;
    const db = getDb();

    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const task = taskDoc.data()!;
    if (task.assignedTo !== user.employeeId) {
      res.status(403).json({ success: false, message: 'This task is not assigned to you' });
      return;
    }

    await taskDoc.ref.update({ status: 'done', completedAt: new Date(), updatedAt: new Date() });
    res.json({ success: true, message: 'Task marked as done' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/employee/verify-invite/:token
// ─────────────────────────────────────────────────────────────────
router.get('/verify-invite/:token', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const db = getDb();

    const snapshot = await db.collection('employees').where('inviteToken', '==', token).limit(1).get();
    if (snapshot.empty) {
      res.status(400).json({ success: false, message: 'Invalid invite link' });
      return;
    }

    const employee = snapshot.docs[0].data();

    if (isOtpExpired(employee.inviteExpiry)) {
      res.status(400).json({ success: false, message: 'Invite link has expired' });
      return;
    }

    if (employee.isSetup as boolean) {
      res.status(400).json({ success: false, message: 'Account already set up' });
      return;
    }

    res.json({ success: true, name: employee.name, email: employee.email });
  } catch (error) {
    next(error);
  }
});

export default router;
