#!/usr/bin/env node

/**
 * Worker process entry point
 * Starts all BullMQ workers in a separate process from the Next.js app
 * 
 * Usage: tsx scripts/worker.ts
 */

// Load environment variables FIRST (Next.js does this automatically, but tsx doesn't)
import 'dotenv/config';

import '../src/lib/queue/workers/email.worker';
import '../src/lib/queue/workers/welcome-email.worker';
import '../src/lib/queue/workers/evaluation.worker';
import '../src/lib/queue/workers/reminder.worker';

// Load environment variables
import { env } from '../src/lib/env';
import { logger } from '../src/lib/logger';

// Determine which Redis connection is being used
const isUpstash = !!env.UPSTASH_REDIS_URL;
const redisConnection = isUpstash
    ? {
        type: 'upstash',
        url: env.UPSTASH_REDIS_URL,
    }
    : {
        type: 'local',
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    };

logger.info({
    redisType: redisConnection.type,
    redisConnection: isUpstash ? redisConnection.url : `${redisConnection.host}:${redisConnection.port}`,
    nodeEnv: env.NODE_ENV,
}, 'Starting all workers');

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error({ error: error.message }, 'Uncaught exception in worker process');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection in worker process');
    process.exit(1);
});
