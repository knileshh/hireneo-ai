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
    // New: Job role info for AI question generation
    jobRole: text('job_role'),
    jobLevel: text('job_level'), // junior, mid, senior, lead
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// AI-generated interview questions
export const interviewQuestions = pgTable('interview_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    jobRole: text('job_role').notNull(),
    jobLevel: text('job_level').notNull(),
    questions: jsonb('questions').notNull().$type<{
        question: string;
        category: string; // technical, behavioral, situational
        difficulty: string; // easy, medium, hard
    }[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Interview scorecards (structured evaluation during interview)
export const scorecards = pgTable('scorecards', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    technicalScore: integer('technical_score'), // 1-5
    communicationScore: integer('communication_score'), // 1-5
    cultureFitScore: integer('culture_fit_score'), // 1-5
    problemSolvingScore: integer('problem_solving_score'), // 1-5
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Evaluations table (AI-generated post-interview)
export const evaluations = pgTable('evaluations', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    score: integer('score').notNull(), // 1-10
    summary: text('summary').notNull(),
    strengths: jsonb('strengths').notNull().$type<string[]>(),
    risks: jsonb('risks').notNull().$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Type exports
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type NewInterviewQuestion = typeof interviewQuestions.$inferInsert;
export type Scorecard = typeof scorecards.$inferSelect;
export type NewScorecard = typeof scorecards.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
