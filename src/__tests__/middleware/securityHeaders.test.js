// src/__tests__/middleware/securityHeaders.test.js
import { jest } from '@jest/globals';

const mockModule = await import('../../middleware/securityHeaders.js');
const { securityHeaders, hstsHeader } = mockModule;

describe('securityHeaders middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { secure: false };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('should set Cache-Control headers', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Expires', '0');
  });

  it('should set content security headers', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
  });

  it('should set frame protection headers', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Permissions-Policy', expect.any(String));
  });

  it('should set cross-origin headers', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('Cross-Origin-Embedder-Policy', 'unsafe-none');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cross-Origin-Opener-Policy',
      'same-origin-allow-popups',
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'cross-origin');
  });

  it('should call next()', () => {
    securityHeaders(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('hstsHeader middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { secure: false };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('should set HSTS when request is secure', () => {
    req.secure = true;
    hstsHeader(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('should not set HSTS in non-secure non-production', () => {
    hstsHeader(req, res, next);
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('should call next()', () => {
    hstsHeader(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
