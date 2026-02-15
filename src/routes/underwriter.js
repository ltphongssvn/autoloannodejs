// src/routes/underwriter.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireUnderwriter } from '../middleware/authorize.js';
import { approve, rejectApp } from '../controllers/underwriter/decisions.js';

const router = Router();
router.use(authenticate, requireUnderwriter);
router.post('/:id/approve', approve);
router.post('/:id/reject', rejectApp);

export default router;
