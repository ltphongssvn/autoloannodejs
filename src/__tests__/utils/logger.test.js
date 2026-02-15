// src/__tests__/utils/logger.test.js
import { jest } from '@jest/globals';

const mockInfo = jest.fn();
const mockAdd = jest.fn();

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

const logger = (await import('../../utils/logger.js')).default;

describe('Logger', () => {
  it('should export all log methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('stream.write should call info with trimmed message', () => {
    logger.stream.write('hello\n');
    expect(mockInfo).toHaveBeenCalledWith('hello');
  });

  it('stream.write handles message without newline', () => {
    logger.stream.write('no newline');
    expect(mockInfo).toHaveBeenCalledWith('no newline');
  });
});
