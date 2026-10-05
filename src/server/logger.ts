import 'server-only';

import pino from 'pino';

/** Structured logs. Never log clinical data, OTPs, phone numbers or message bodies (CLAUDE.md). */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { app: 'yhc-platform', env: process.env.APP_ENV ?? 'local' },
  redact: {
    paths: [
      'phone',
      'email',
      'otp',
      'body',
      '*.phone',
      '*.email',
      '*.otp',
      '*.body',
      'req.headers.authorization',
    ],
    censor: '[redacted]',
  },
});

export function requestLogger(requestId: string) {
  return logger.child({ requestId });
}
