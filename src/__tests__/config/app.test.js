// src/__tests__/config/app.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('dotenv', () => ({
  default: { config: jest.fn() },
  config: jest.fn(),
}));

const appConfig = (await import('../../config/app.js')).default;

describe('App Config', () => {
  it('should define port', () => {
    expect(appConfig.port).toBe(3000);
  });

  it('should define jwt config', () => {
    expect(appConfig.jwt).toBeDefined();
    expect(appConfig.jwt.algorithm).toBe('HS256');
    expect(appConfig.jwt.expiration).toBe(3600);
  });

  it('should define cors config', () => {
    expect(appConfig.cors).toBeDefined();
    expect(appConfig.cors.credentials).toBe(true);
    expect(appConfig.cors.exposedHeaders).toContain('Authorization');
  });

  it('should define rate limit config', () => {
    expect(appConfig.rateLimit.general.max).toBe(300);
    expect(appConfig.rateLimit.login.max).toBe(5);
    expect(appConfig.rateLimit.signup.max).toBe(10);
    expect(appConfig.rateLimit.passwordReset.max).toBe(5);
  });

  it('should define pagination config', () => {
    expect(appConfig.pagination.defaultLimit).toBe(20);
    expect(appConfig.pagination.maxLimit).toBe(100);
  });

  it('should define api version config', () => {
    expect(appConfig.api.version).toBe('1.0.2');
    expect(appConfig.api.supportedVersions).toContain('1.0');
  });

  it('should define smtp config', () => {
    expect(appConfig.smtp.host).toBe('smtp.gmail.com');
    expect(appConfig.smtp.port).toBe(587);
  });

  it('should define password config', () => {
    expect(appConfig.password.minLength).toBe(6);
    expect(appConfig.password.maxLength).toBe(128);
  });

  it('should define mfa config', () => {
    expect(appConfig.mfa.issuer).toBe('AutoLoan');
    expect(appConfig.mfa.backupCodesCount).toBe(10);
  });

  it('should define security config', () => {
    expect(appConfig.security.blockedIps).toEqual([]);
  });
});
