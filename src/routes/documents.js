// src/routes/documents.js
// Maps: config/routes.rb resources :documents
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireStaff } from '../middleware/authorize.js';
import { listByApplication, upload, verify, reject } from '../controllers/documents.js';

const router = Router();

router.use(authenticate);
router.get('/applications/:applicationId/documents', listByApplication);
router.post('/applications/:applicationId/documents', upload);
router.patch('/documents/:id/verify', requireStaff, verify);
router.patch('/documents/:id/reject', requireStaff, reject);

export default router;
