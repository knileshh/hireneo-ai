import { z } from 'zod';

const envSchema = z.object({
    // Database (Supabase)
    DATABASE_URL: z.string().url(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Redis (Upstash or local)
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
    UPSTASH_REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // External APIs
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
    RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),

    // Polar.sh
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    POLAR_PRO_PRODUCT_ID: z.string().optional(),
    POLAR_ENTERPRISE_PRODUCT_ID: z.string().optional(),

    // App Config
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
});

// Parse and validate environment variables
// Skip validation during build (Docker) or if explicitly skipped
const skipValidation = process.env.SKIP_ENV_VALIDATION === '1' || process.env.SKIP_ENV_VALIDATION === 'true';

export const env = skipValidation
    ? {
        ...process.env,
        // Provide defaults that are critical for build/runtime init even when skipping validation
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        NODE_ENV: process.env.NODE_ENV || 'development',
    } as unknown as z.infer<typeof envSchema>
    : envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
