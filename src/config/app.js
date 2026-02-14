// src/config/app.js
// Maps: Rails config/application.rb + config/initializers/
import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',

  // JWT (maps: config/initializers/devise_jwt.rb)
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiration: parseInt(process.env.JWT_EXPIRATION || '3600', 10), // 1 hour in seconds
    algorithm: 'HS256',
  },

  // CORS (maps: config/initializers/cors.rb)
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Authorization'],
  },

  // Rate Limiting (maps: config/initializers/rack_attack.rb)
  rateLimit: {
    general: { windowMs: 5 * 60 * 1000, max: 300 },
    login: { windowMs: 20 * 1000, max: 5 },
    signup: { windowMs: 60 * 60 * 1000, max: 10 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 5 },
  },

  // Pagination (maps: config/initializers/pagy.rb)
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // API Versioning (maps: concerns/api_versioning.rb)
  api: {
    version: '1.0.2',
    supportedVersions: ['1.0', '1.0.1', '1.0.2'],
  },

  // Email/SMTP (maps: config/environments/production.rb)
  smtp: {
    host: process.env.SMTP_ADDRESS || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@autoloan.example.com',
  },

  // Password (maps: config/initializers/devise.rb)
  password: {
    minLength: 6,
    maxLength: 128,
    saltRounds: process.env.NODE_ENV === 'test' ? 1 : 12,
  },

  // MFA (maps: services/mfa_service.rb)
  mfa: {
    issuer: 'AutoLoan',
    backupCodesCount: 10,
  },

  // Security Headers (maps: config/initializers/security_headers.rb)
  security: {
    blockedIps: (process.env.BLOCKED_IPS || '').split(',').filter(Boolean),
  },
};

export default appConfig;
