import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { env } from '@/lib/env';
import Redis from 'ioredis';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
    const checks = {
        database: false,
        redis: false,
        timestamp: new Date().toISOString(),
    };

    try {
        // Check database connection
        await db.execute(sql`SELECT 1`);
        checks.database = true;
    } catch (error) {
        console.error('Database health check failed:', error);
    }

    try {
        // Check Redis connection
        const redis = new Redis({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            lazyConnect: true,
        });
        await redis.ping();
        checks.redis = true;
        await redis.quit();
    } catch (error) {
        console.error('Redis health check failed:', error);
    }

    const isHealthy = checks.database && checks.redis;

    return NextResponse.json(
        {
            status: isHealthy ? 'healthy' : 'unhealthy',
            checks,
        },
        { status: isHealthy ? 200 : 503 }
    );
}
