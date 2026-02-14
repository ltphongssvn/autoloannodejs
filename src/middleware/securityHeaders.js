// src/middleware/securityHeaders.js
// Maps: app/controllers/concerns/security_headers.rb + config/initializers/security_headers.rb

const CSP_POLICY = "default-src 'none'; frame-ancestors 'none'";

export const securityHeaders = (_req, res, next) => {
  // Cache control (maps: set_cache_control_headers)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Content security (maps: set_content_security_headers)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', CSP_POLICY);

  // Frame protection (maps: set_frame_protection_headers)
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cross-origin headers (maps: config/initializers/security_headers.rb)
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  next();
};

export const hstsHeader = (req, res, next) => {
  if (req.secure || process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

export default { securityHeaders, hstsHeader };
