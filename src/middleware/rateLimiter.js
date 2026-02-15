// src/middleware/rateLimiter.js
// Maps: config/initializers/rack_attack.rb
import rateLimit from 'express-rate-limit';
import appConfig from '../config/app.js';

const createLimiter = (config, message) =>
  rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RateLimitExceeded', message } },
  });

export const generalLimiter = createLimiter(
  appConfig.rateLimit.general,
  'Too many requests, please try again later',
);

export const loginLimiter = createLimiter(
  appConfig.rateLimit.login,
  'Too many login attempts, please try again later',
);

export const signupLimiter = createLimiter(
  appConfig.rateLimit.signup,
  'Too many signup attempts, please try again later',
);

export const passwordResetLimiter = createLimiter(
  appConfig.rateLimit.passwordReset,
  'Too many password reset attempts, please try again later',
);

export default { generalLimiter, loginLimiter, signupLimiter, passwordResetLimiter };
