// src/utils/errors.js
// Maps: custom error handling across Rails controllers

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'InternalError') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const msg = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(msg, 404, 'NotFound');
    this.resource = resource;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422, 'ValidationError');
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'Unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 403, 'Forbidden');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'Conflict');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RateLimitExceeded');
  }
}

export default {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
};
