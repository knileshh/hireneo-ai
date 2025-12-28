import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../env';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export schema for convenience
export { schema };
