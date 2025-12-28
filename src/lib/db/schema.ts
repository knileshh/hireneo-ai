import { pgTable, uuid, text, timestamp, pgEnum, integer, jsonb } from 'drizzle-orm/pg-core';

// Interview status enum - state machine
export const interviewStatus = pgEnum('interview_status', [
    'CREATED',
    'SCHEDULED',
    'COMPLETED',
    'EVALUATION_PENDING',
    'EVALUATED'
]);

// Interviews table (NO separate candidates table - simplified)
export const interviews = pgTable('interviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    candidateName: text('candidate_name').notNull(),
    candidateEmail: text('candidate_email').notNull(),
    interviewerEmail: text('interviewer_email').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: interviewStatus('status').default('CREATED').notNull(),
    meetingLink: text('meeting_link'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Evaluations table
export const evaluations = pgTable('evaluations', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(), // unique constraint prevents duplicate evaluations
    score: integer('score').notNull(), // 1-10
    summary: text('summary').notNull(),
    strengths: jsonb('strengths').notNull().$type<string[]>(), // Native JSONB support
    risks: jsonb('risks').notNull().$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Type exports
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
