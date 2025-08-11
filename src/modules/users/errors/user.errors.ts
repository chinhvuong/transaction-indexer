import { createErrorFactory } from '@/shared/errors/app-errors';

export const UserErrors = createErrorFactory({
  notFoundById: {
    code: 'USER_NOT_FOUND_BY_ID',
    statusCode: 404,
    message: (id: string) => `User with ID ${id} not found`,
  },
  notFoundByEmail: {
    code: 'USER_NOT_FOUND_BY_EMAIL',
    statusCode: 404,
    message: (email: string) => `User with email ${email} not found`,
  },
  alreadyExists: {
    code: 'USER_ALREADY_EXISTS',
    statusCode: 409,
    message: (email: string) => `User with email ${email} already exists`,
  },
  usernameTaken: {
    code: 'USERNAME_TAKEN',
    statusCode: 409,
    message: (username: string) => `Username "${username}" is already taken`,
  },
});
