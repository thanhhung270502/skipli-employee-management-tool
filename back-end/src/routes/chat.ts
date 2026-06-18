import { Router, Response, NextFunction } from 'express';
import { getDb } from '../services/firebase';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// ─────────────────────────────────────────────────────────────────
// GET /api/chat/:roomId/messages
// roomId format: {ownerPhone}_{employeeId}
// ─────────────────────────────────────────────────────────────────
router.get('/:roomId/messages', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    const limit = parseInt((req.query.limit as string) ?? '50', 10);

    const db = getDb();
    const snapshot = await db
      .collection('messages')
      .doc(roomId)
      .collection('chats')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    // Reverse to get chronological order (oldest → newest)
    const messages = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .reverse();

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

export default router;
