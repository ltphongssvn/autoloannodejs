// src/__tests__/config/database.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('dotenv', () => ({
  default: { config: jest.fn() },
  config: jest.fn(),
}));

jest.unstable_mockModule('sequelize', () => {
  const inst = {};
  const MockSequelize = jest.fn().mockReturnValue(inst);
  return { Sequelize: MockSequelize };
});

describe('Database Config', () => {
  it('should export sequelize instance and config', async () => {
    const mod = await import('../../config/database.js');
    expect(mod.sequelize).toBeDefined();
    expect(mod.config).toBeDefined();
  });

  it('should have development config with correct database name', async () => {
    const { config } = await import('../../config/database.js');
    expect(config.development.database).toBe('autoloan_development');
    expect(config.development.dialect).toBe('postgres');
    expect(config.development.host).toBe('localhost');
    expect(config.development.port).toBe(5432);
  });

  it('should have test config', async () => {
    const { config } = await import('../../config/database.js');
    expect(config.test.database).toBe('autoloan_test');
    expect(config.test.logging).toBe(false);
  });

  it('should have production config with url and ssl', async () => {
    const { config } = await import('../../config/database.js');
    expect(config.production.dialect).toBe('postgres');
    expect(config.production.logging).toBe(false);
    expect(config.production.dialectOptions.ssl).toBeDefined();
  });

  it('should have pool config for all environments', async () => {
    const { config } = await import('../../config/database.js');
    expect(config.development.pool.max).toBeGreaterThan(0);
    expect(config.test.pool.max).toBeGreaterThan(0);
    expect(config.production.pool.max).toBeGreaterThan(0);
  });
});
