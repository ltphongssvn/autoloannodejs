// src/routes/index.js
// Maps: config/routes.rb
import { Router } from 'express';
import authRoutes from './auth.js';
import applicationRoutes from './applications.js';
import documentRoutes from './documents.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/', documentRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
