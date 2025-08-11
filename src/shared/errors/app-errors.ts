import { BaseError } from './base.error';

export interface ErrorDefinition<TArgs extends unknown[] = []> {
  code: string;
  message: (...args: TArgs) => string;
  statusCode: number;
}

export class AppError<TArgs extends unknown[] = []> extends BaseError {
  constructor(definition: ErrorDefinition<TArgs>, ...args: TArgs) {
    const message = definition.message(...args);
    super(message, definition.code, definition.statusCode);
  }
}

export function createErrorFactory<
  const T extends Record<string, ErrorDefinition<any>>,
>(errors: T) {
  const factories = {} as {
    [K in keyof T]: (
      ...args: Parameters<T[K]['message']>
    ) => AppError<Parameters<T[K]['message']>>;
  };

  for (const key in errors) {
    const errorDef = errors[key];
    factories[key] = ((...args: unknown[]) =>
      new AppError(errorDef, ...args)) as (typeof factories)[typeof key];
  }

  return factories;
}
