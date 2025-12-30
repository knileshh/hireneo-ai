import { env } from '@/lib/env';

/**
 * Parse redis:// URL into connection options for ioredis/BullMQ
 */
function parseRedisUrl(url: string) {
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379'),
        password: parsed.password || undefined,
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
}

/**
 * Get Redis connection configuration
 * Supports Upstash TCP (redis://) or local Redis
 */
export function getRedisConnection() {
    if (env.UPSTASH_REDIS_URL) {
        return parseRedisUrl(env.UPSTASH_REDIS_URL);
    }

    return {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    };
}
