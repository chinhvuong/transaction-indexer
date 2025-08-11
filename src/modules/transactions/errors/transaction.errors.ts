import { createErrorFactory } from '@/shared/errors/app-errors';

export const TransactionErrors = createErrorFactory({
  notFoundById: {
    code: 'TRANSACTION_NOT_FOUND_BY_ID',
    statusCode: 404,
    message: (id: string) => `Transaction with ID ${id} not found`,
  },
  notFoundByHash: {
    code: 'TRANSACTION_NOT_FOUND_BY_HASH',
    statusCode: 404,
    message: (hash: string) => `Transaction with hash ${hash} not found`,
  },
  invalidData: {
    code: 'TRANSACTION_INVALID_DATA',
    statusCode: 400,
    message: (field: string) => `Invalid ${field} provided`,
  },
});
