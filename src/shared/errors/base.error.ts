export abstract class BaseError extends Error {
  public readonly errorCode: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    errorCode: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      errorCode: this.errorCode,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR') {
    super(message, errorCode, 400);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, errorCode: string = 'AUTHENTICATION_ERROR') {
    super(message, errorCode, 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, errorCode: string = 'AUTHORIZATION_ERROR') {
    super(message, errorCode, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, errorCode: string = 'NOT_FOUND_ERROR') {
    super(message, errorCode, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, errorCode: string = 'CONFLICT_ERROR') {
    super(message, errorCode, 409);
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string, errorCode: string = 'INTERNAL_SERVER_ERROR') {
    super(message, errorCode, 500, false);
  }
}
