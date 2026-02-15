// src/routes/users.js
// Maps: config/routes.rb resources :users + profile
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireStaff } from '../middleware/authorize.js';
import { profile, updateProfile, listUsers } from '../controllers/users.js';

const router = Router();
router.use(authenticate);
router.get('/profile', profile);
router.patch('/profile', updateProfile);
router.get('/', requireStaff, listUsers);

export default router;
