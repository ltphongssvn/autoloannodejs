// src/__tests__/middleware/rateLimiter.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('express-rate-limit', () => ({
  default: jest.fn((opts) => {
    const middleware = jest.fn((_req, _res, next) => next());
    middleware.opts = opts;
    return middleware;
  }),
}));

jest.unstable_mockModule('../../config/app.js', () => ({
  default: {
    rateLimit: {
      general: { max: 300, windowMs: 5 * 60 * 1000 },
      login: { max: 5, windowMs: 20 * 1000 },
      signup: { max: 10, windowMs: 60 * 60 * 1000 },
      passwordReset: { max: 5, windowMs: 60 * 60 * 1000 },
    },
  },
}));

const { generalLimiter, loginLimiter, signupLimiter, passwordResetLimiter } =
  await import('../../middleware/rateLimiter.js');

describe('Rate Limiter Middleware', () => {
  it('should export generalLimiter', () => {
    expect(generalLimiter).toBeDefined();
  });

  it('should export loginLimiter', () => {
    expect(loginLimiter).toBeDefined();
  });

  it('should export signupLimiter', () => {
    expect(signupLimiter).toBeDefined();
  });

  it('should export passwordResetLimiter', () => {
    expect(passwordResetLimiter).toBeDefined();
  });
});
