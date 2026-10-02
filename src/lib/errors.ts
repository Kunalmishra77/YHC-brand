export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Shape returned by route handlers. Never includes stack traces. */
export function toErrorBody(error: unknown): { error: { code: string; message: string }; status: number } {
  if (error instanceof AppError) {
    return { error: { code: error.code, message: error.message }, status: error.status };
  }
  return { error: { code: 'internal', message: 'Something went wrong. Please try again.' }, status: 500 };
}
