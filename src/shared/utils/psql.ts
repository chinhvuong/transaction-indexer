export function isPsqlConflictError(error: unknown): boolean {
  return (error as { code?: string })?.code === '23505';
}
