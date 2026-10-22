import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    CLIENT_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
});

export const env = schema.parse(process.env);