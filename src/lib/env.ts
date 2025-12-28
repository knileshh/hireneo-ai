import { z } from 'zod';

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),

    // External APIs
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
    RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),

    // App Config
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
