// src/__tests__/utils/errors.test.js

const {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
} = await import('../../utils/errors.js');

describe('AppError', () => {
  it('should create error with defaults', () => {
    const err = new AppError('something broke');
    expect(err.message).toBe('something broke');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('InternalError');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it('should accept custom statusCode and code', () => {
    const err = new AppError('bad', 400, 'BadRequest');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BadRequest');
  });
});

describe('NotFoundError', () => {
  it('should default message', () => {
    const err = new NotFoundError();
    expect(err.message).toBe('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NotFound');
  });

  it('should include resource name', () => {
    const err = new NotFoundError('Application');
    expect(err.message).toBe('Application not found');
    expect(err.resource).toBe('Application');
  });

  it('should include resource id', () => {
    const err = new NotFoundError('Application', 42);
    expect(err.message).toBe('Application with id 42 not found');
  });
});

describe('ValidationError', () => {
  it('should default message and empty errors', () => {
    const err = new ValidationError();
    expect(err.message).toBe('Validation failed');
    expect(err.statusCode).toBe(422);
    expect(err.errors).toEqual([]);
  });

  it('should accept custom errors array', () => {
    const errs = [{ field: 'email', message: 'required' }];
    const err = new ValidationError('Invalid input', errs);
    expect(err.errors).toEqual(errs);
  });
});

describe('UnauthorizedError', () => {
  it('should set 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('Unauthorized');
  });

  it('should accept custom message', () => {
    const err = new UnauthorizedError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('ForbiddenError', () => {
  it('should set 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('Forbidden');
  });
});

describe('ConflictError', () => {
  it('should set 409', () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('Conflict');
  });
});

describe('RateLimitError', () => {
  it('should set 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RateLimitExceeded');
  });
});
