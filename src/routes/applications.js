// src/routes/applications.js
// Maps: config/routes.rb resources :loan_applications
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { index, show, create, submit, destroy } from '../controllers/applications.js';

const router = Router();

router.use(authenticate);
router.get('/', index);
router.get('/:id', show);
router.post('/', create);
router.post('/:id/submit', submit);
router.delete('/:id', destroy);

export default router;
