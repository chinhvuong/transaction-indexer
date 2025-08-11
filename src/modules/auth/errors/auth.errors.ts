import { createErrorFactory } from '@/shared/errors/app-errors';

export const AuthErrors = createErrorFactory({
  invalidCredentials: {
    code: 'AUTH_INVALID_CREDENTIALS',
    statusCode: 401,
    message: () => 'Invalid email or password',
  },
  userNotFound: {
    code: 'AUTH_USER_NOT_FOUND',
    statusCode: 404,
    message: (email: string) => `User with email ${email} not found`,
  },
  userAlreadyExists: {
    code: 'AUTH_USER_ALREADY_EXISTS',
    statusCode: 409,
    message: (email: string) => `User with email ${email} already exists`,
  },
  passwordMismatch: {
    code: 'AUTH_PASSWORD_MISMATCH',
    statusCode: 400,
    message: () => 'Current password is incorrect',
  },
  usernameAlreadyTaken: {
    code: 'AUTH_USERNAME_ALREADY_TAKEN',
    statusCode: 409,
    message: (username: string) => `Username "${username}" is already taken`,
  },
  invalidRefreshToken: {
    code: 'AUTH_INVALID_REFRESH_TOKEN',
    statusCode: 401,
    message: () => 'Invalid refresh token',
  },
  sessionInvalid: {
    code: 'AUTH_SESSION_INVALID',
    statusCode: 401,
    message: (sessionId: string) =>
      `Session with id ${sessionId} has been deleted or expired`,
  },
  replayRefreshToken: {
    code: 'AUTH_REPLAY_REFRESH_TOKEN',
    statusCode: 401,
    message: (sessionId: string) =>
      `Replay attack detected for session ${sessionId}`,
  },
  invalidSignature: {
    code: 'AUTH_INVALID_SIGNATURE',
    statusCode: 401,
    message: () => 'Invalid signature provided',
  },
  invalidNonce: {
    code: 'AUTH_INVALID_NONCE',
    statusCode: 401,
    message: () => 'Invalid or expired nonce',
  },
});
