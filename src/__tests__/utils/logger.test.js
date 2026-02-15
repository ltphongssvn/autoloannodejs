// src/__tests__/utils/logger.test.js
import { jest } from '@jest/globals';

const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();
const mockAdd = jest.fn();

jest.unstable_mockModule('winston', () => ({
  default: {
    createLogger: jest.fn().mockReturnValue({
      info: mockInfo,
      error: mockError,
      warn: mockWarn,
      debug: mockDebug,
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
  it('should export logger with info method', () => {
    logger.info('test');
    expect(mockInfo).toHaveBeenCalledWith('test');
  });

  it('should export logger with error method', () => {
    logger.error('err');
    expect(mockError).toHaveBeenCalledWith('err');
  });

  it('should export logger with warn method', () => {
    logger.warn('warning');
    expect(mockWarn).toHaveBeenCalledWith('warning');
  });

  it('should export logger with debug method', () => {
    logger.debug('dbg');
    expect(mockDebug).toHaveBeenCalledWith('dbg');
  });

  it('stream.write should call info with trimmed message', () => {
    logger.stream.write('hello\n');
    expect(mockInfo).toHaveBeenCalledWith('hello');
  });
});
