// src/__tests__/utils/logger.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    stream: { write: jest.fn() },
  };
  return {
    default: {
      createLogger: jest.fn().mockReturnValue(mockLogger),
      format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        colorize: jest.fn(),
        simple: jest.fn(),
        printf: jest.fn(),
      },
      transports: {
        Console: jest.fn(),
        File: jest.fn(),
      },
    },
  };
});

const logger = (await import('../../utils/logger.js')).default;

describe('Logger', () => {
  it('should export logger with standard methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should expose stream for morgan integration', () => {
    expect(logger.stream).toBeDefined();
    expect(logger.stream.write).toBeDefined();
  });
});
