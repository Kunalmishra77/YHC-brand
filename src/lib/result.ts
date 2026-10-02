export type Ok<T> = { ok: true; data: T };
export type Err<E = { code: string; message: string }> = { ok: false; error: E };
export type Result<T, E = { code: string; message: string }> = Ok<T> | Err<E>;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err(code: string, message: string): Err {
  return { ok: false, error: { code, message } };
}
