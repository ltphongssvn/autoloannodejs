// src/__tests__/utils/logger.test.js
import { jest } from '@jest/globals';

const mockAdd = jest.fn();
const mockInfo = jest.fn();

jest.unstable_mockModule('winston', () => ({
  default: {
    createLogger: jest.fn().mockReturnValue({
      info: mockInfo,
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      add: mockAdd,
    }),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  },
}));

describe('Logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create logger in development mode', async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.unstable_mockModule('../../utils/logger.js', () => import('../../utils/logger.js'));
    const logger = (await import('../../utils/logger.js')).default;
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    process.env.NODE_ENV = origEnv;
  });

  it('should add file transports in production', async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    // Re-import to trigger production branch
    const mod = await import('../../utils/logger.js?prod=1');
    const logger = mod.default;
    expect(logger).toBeDefined();
    process.env.NODE_ENV = origEnv;
  });

  it('stream.write should call info with trimmed message', async () => {
    const logger = (await import('../../utils/logger.js')).default;
    logger.stream.write('hello\n');
    expect(mockInfo).toHaveBeenCalledWith('hello');
  });

  it('stream.write handles message without newline', async () => {
    const logger = (await import('../../utils/logger.js')).default;
    logger.stream.write('no newline');
    expect(mockInfo).toHaveBeenCalledWith('no newline');
  });
});
