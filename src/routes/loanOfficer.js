// src/routes/loanOfficer.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireStaff } from '../middleware/authorize.js';
import { startReview, requestDocuments, addNote } from '../controllers/loanOfficer/review.js';

const router = Router();
router.use(authenticate, requireStaff);
router.post('/:id/review', startReview);
router.post('/:id/request-documents', requestDocuments);
router.post('/:id/notes', addNote);

export default router;
