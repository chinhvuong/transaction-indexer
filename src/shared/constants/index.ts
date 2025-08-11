export enum USER_ROLE {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}
export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;

export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '7d',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
  },
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};
