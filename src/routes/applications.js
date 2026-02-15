// src/routes/applications.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { index, show, create, submit, destroy } from '../controllers/applications.js';
import { update } from '../controllers/applicationUpdate.js';
import { sign } from '../controllers/applicationSign.js';

const router = Router();
router.use(authenticate);
router.get('/', index);
router.get('/:id', show);
router.post('/', create);
router.patch('/:id', update);
router.post('/:id/submit', submit);
router.post('/:id/sign', sign);
router.delete('/:id', destroy);

export default router;
