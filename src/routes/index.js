// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import applicationRoutes from './applications.js';
import documentRoutes from './documents.js';
import loanOfficerRoutes from './loanOfficer.js';
import underwriterRoutes from './underwriter.js';
import userRoutes from './users.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/', documentRoutes);
router.use('/loan-officer/applications', loanOfficerRoutes);
router.use('/underwriter/applications', underwriterRoutes);
router.use('/users', userRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
