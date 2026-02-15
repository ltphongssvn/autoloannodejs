// src/middleware/errorHandler.js
// Maps: Rails rescue_from handlers in base_controller.rb
import { AppError, ValidationError } from '../utils/errors.js';

export const errorHandler = (err, _req, res, _next) => {
  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({
      error: { code: 'ValidationError', message: 'Validation failed', details },
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(409).json({
      error: { code: 'Conflict', message: 'Resource conflict', details },
    });
  }

  // Custom ValidationError with errors array
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.errors },
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unknown errors
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: {
      code: 'InternalError',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};

export default { errorHandler };
