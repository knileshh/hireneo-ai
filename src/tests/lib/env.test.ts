import { describe, it, expect, beforeEach } from 'vitest';

describe('Environment Configuration', () => {
    describe('Environment Variable Structure', () => {
        it('should have process.env available', () => {
            expect(process.env).toBeDefined();
            expect(typeof process.env).toBe('object');
        });

        it('should have NODE_ENV available in test environment', () => {
            expect(process.env.NODE_ENV).toBeDefined();
            expect(process.env.NODE_ENV).toBe('test');
        });
    });

    describe('Environment Variable Formats', () => {
        it('DATABASE_URL should be a valid PostgreSQL connection string', () => {
            const dbUrl = process.env.DATABASE_URL;
            if (dbUrl) {
                expect(dbUrl).toMatch(/^postgres(ql)?:\/\/.+/);
            }
        });

        it('NEXT_PUBLIC_SUPABASE_URL should be a valid HTTPS URL', () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (supabaseUrl) {
                expect(supabaseUrl).toMatch(/^https:\/\/.+\.supabase\.co$/);
            }
        });

        it('NODE_ENV should be development or production', () => {
            const nodeEnv = process.env.NODE_ENV;
            if (nodeEnv) {
                expect(['development', 'production', 'test']).toContain(nodeEnv);
            }
        });
    });

    describe('API Keys Security', () => {
        it('API keys should not be empty strings', () => {
            const openaiKey = process.env.OPENAI_API_KEY;
            if (openaiKey !== undefined) {
                expect(openaiKey.trim()).not.toBe('');
            }
        });

        it('RESEND_API_KEY should start with re_ prefix', () => {
            const resendKey = process.env.RESEND_API_KEY;
            if (resendKey) {
                expect(resendKey).toMatch(/^re_/);
            }
        });

        it('Supabase anon key should be a valid JWT format', () => {
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (anonKey) {
                // JWT format: three base64 parts separated by dots
                expect(anonKey.split('.').length).toBe(3);
            }
        });
    });
});
