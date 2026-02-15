// src/routes/auth.js
import { Router } from 'express';
import { register } from '../controllers/auth/registrations.js';
import { login, logout } from '../controllers/auth/sessions.js';
import { changePassword } from '../controllers/auth/passwords.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, signupLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/signup', signupLimiter, register);
router.post('/login', loginLimiter, login);
router.delete('/logout', authenticate, logout);
router.patch('/password', authenticate, changePassword);

export default router;
