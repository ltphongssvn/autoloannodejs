// src/routes/apiKeys.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listKeys, createKey, revokeKey } from '../controllers/apiKeys.js';

const router = Router();
router.use(authenticate);
router.get('/', listKeys);
router.post('/', createKey);
router.delete('/:id', revokeKey);

export default router;
