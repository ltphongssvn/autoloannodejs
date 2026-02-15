// src/__tests__/middleware/errorHandler.test.js
const { AppError, ValidationError, NotFoundError } = await import('../../utils/errors.js');
const { errorHandler } = await import('../../middleware/errorHandler.js');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle AppError with correct status and structure', () => {
    const err = new AppError('bad request', 400, 'BadRequest');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'BadRequest', message: 'bad request' }),
      }),
    );
  });

  it('should handle ValidationError with errors array', () => {
    const errs = [{ field: 'email', message: 'required' }];
    const err = new ValidationError('Invalid', errs);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ details: errs }),
      }),
    );
  });

  it('should handle NotFoundError', () => {
    const err = new NotFoundError('Application', 5);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle Sequelize ValidationError', () => {
    const err = new Error('Validation error');
    err.name = 'SequelizeValidationError';
    err.errors = [{ path: 'email', message: 'must be unique' }];
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('should handle Sequelize UniqueConstraintError', () => {
    const err = new Error('Unique constraint');
    err.name = 'SequelizeUniqueConstraintError';
    err.errors = [{ path: 'email', message: 'must be unique' }];
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('should handle unknown errors as 500', () => {
    const err = new Error('unexpected');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'InternalError' }),
      }),
    );
  });

  it('should not leak stack trace in production', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = new Error('secret failure');
    errorHandler(err, req, res, next);
    const response = res.json.mock.calls[0][0];
    expect(response.error.stack).toBeUndefined();
    process.env.NODE_ENV = origEnv;
  });
});
