import { pgTable, uuid, text, timestamp, pgEnum, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============ ENUMS ============

// Interview status enum - state machine
export const interviewStatus = pgEnum('interview_status', [
    'CREATED',
    'SCHEDULED',
    'IN_PROGRESS',      // Candidate is taking assessment
    'COMPLETED',        // Assessment finished, awaiting evaluation
    'EVALUATION_PENDING',
    'EVALUATED'
]);

// Question category enum
export const questionCategory = pgEnum('question_category', [
    'personal',
    'behavioral',
    'technical'
]);

// ============ TABLES ============

// Jobs table - Job openings that interviews belong to
export const jobs = pgTable('jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    requirements: jsonb('requirements').$type<string[]>(),
    level: text('level'), // junior, mid, senior, lead
    department: text('department'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Interviews table
export const interviews = pgTable('interviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id').references(() => jobs.id), // Optional job reference
    candidateName: text('candidate_name').notNull(),
    candidateEmail: text('candidate_email').notNull(),
    interviewerEmail: text('interviewer_email').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: interviewStatus('status').default('CREATED').notNull(),
    meetingLink: text('meeting_link'),
    notes: text('notes'),
    jobRole: text('job_role'),
    jobLevel: text('job_level'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Assessment tokens - Secure access for candidates
export const assessmentTokens = pgTable('assessment_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'), // When candidate started
    completedAt: timestamp('completed_at'), // When candidate finished
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Candidate responses - Answers to interview questions
export const candidateResponses = pgTable('candidate_responses', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull(),
    questionIndex: integer('question_index').notNull(), // Order of question
    question: text('question').notNull(),
    category: questionCategory('category').notNull(),
    timeLimit: integer('time_limit').notNull(), // seconds
    audioUrl: text('audio_url'), // Path to audio file
    transcript: text('transcript'), // Transcribed text
    textAnswer: text('text_answer'), // If typed instead
    durationSeconds: integer('duration_seconds'), // How long they took
    aiScore: integer('ai_score'), // 1-5 score from AI
    aiNotes: text('ai_notes'), // AI feedback on this answer
    submittedAt: timestamp('submitted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// AI-generated interview questions
export const interviewQuestions = pgTable('interview_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    jobRole: text('job_role').notNull(),
    jobLevel: text('job_level').notNull(),
    questions: jsonb('questions').notNull().$type<{
        question: string;
        category: 'personal' | 'behavioral' | 'technical';
        difficulty: string;
        timeLimit: number; // seconds
    }[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// Interview scorecards (structured evaluation during interview)
export const scorecards = pgTable('scorecards', {
    id: uuid('id').defaultRandom().primaryKey(),
    interviewId: uuid('interview_id').references(() => interviews.id).notNull().unique(),
    technicalScore: integer('technical_score'),
    communicationScore: integer('communication_score'),
    cultureFitScore: integer('culture_fit_score'),
    problemSolvingScore: integer('problem_solving_score'),
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
    recommendation: text('recommendation'), // 'strong_hire' | 'hire' | 'maybe' | 'pass'
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============ RELATIONS ============

export const jobsRelations = relations(jobs, ({ many }) => ({
    interviews: many(interviews)
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
    job: one(jobs, {
        fields: [interviews.jobId],
        references: [jobs.id]
    }),
    questions: one(interviewQuestions),
    responses: many(candidateResponses),
    scorecard: one(scorecards),
    evaluation: one(evaluations),
    assessmentToken: one(assessmentTokens)
}));

export const candidateResponsesRelations = relations(candidateResponses, ({ one }) => ({
    interview: one(interviews, {
        fields: [candidateResponses.interviewId],
        references: [interviews.id]
    })
}));

// ============ TYPE EXPORTS ============

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type AssessmentToken = typeof assessmentTokens.$inferSelect;
export type NewAssessmentToken = typeof assessmentTokens.$inferInsert;
export type CandidateResponse = typeof candidateResponses.$inferSelect;
export type NewCandidateResponse = typeof candidateResponses.$inferInsert;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type NewInterviewQuestion = typeof interviewQuestions.$inferInsert;
export type Scorecard = typeof scorecards.$inferSelect;
export type NewScorecard = typeof scorecards.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
