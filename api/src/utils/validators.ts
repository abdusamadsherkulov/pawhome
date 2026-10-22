import {z} from 'zod';

// accepts "@name" or "name" and stores it without the @
export const telegramField = z
  .string()
  .trim()
  .regex(/^@?[a-zA-Z0-9_]{5,32}$/, 'Invalid Telegram username')
  .transform(v => v.replace(/^@/, ''));