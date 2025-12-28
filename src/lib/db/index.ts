import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../env';
import { relations } from 'drizzle-orm';
import { interviews, evaluations } from './schema';

// Define relations for proper query building with "with"
export const interviewsRelations = relations(interviews, ({ one }) => ({
    evaluation: one(evaluations, {
        fields: [interviews.id],
        references: [evaluations.interviewId],
    }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
    interview: one(interviews, {
        fields: [evaluations.interviewId],
        references: [interviews.id],
    }),
}));

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

// Create Drizzle instance with schema and relations
export const db = drizzle(pool, {
    schema: {
        ...schema,
        interviewsRelations,
        evaluationsRelations,
    }
});

// Export schema for convenience
export { schema };
