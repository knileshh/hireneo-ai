import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();

    try {
        console.log('Applying schema updates...');

        // Add IN_PROGRESS status if not exists
        await client.query(`
            DO $$ BEGIN
                ALTER TYPE "public"."interview_status" ADD VALUE IF NOT EXISTS 'IN_PROGRESS' BEFORE 'COMPLETED';
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `).catch(() => console.log('IN_PROGRESS status already exists or added'));

        // Create question_category enum if not exists
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."question_category" AS ENUM('personal', 'behavioral', 'technical');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✓ Created question_category enum');

        // Create jobs table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "jobs" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "title" text NOT NULL,
                "description" text,
                "requirements" jsonb,
                "level" text,
                "department" text,
                "is_active" boolean DEFAULT true NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('✓ Created jobs table');

        // Create assessment_tokens table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "assessment_tokens" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "interview_id" uuid NOT NULL REFERENCES "interviews"("id"),
                "token" text NOT NULL UNIQUE,
                "expires_at" timestamp NOT NULL,
                "used_at" timestamp,
                "completed_at" timestamp,
                "created_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "assessment_tokens_interview_id_unique" UNIQUE("interview_id")
            );
        `);
        console.log('✓ Created assessment_tokens table');

        // Create candidate_responses table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "candidate_responses" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "interview_id" uuid NOT NULL REFERENCES "interviews"("id"),
                "question_index" integer NOT NULL,
                "question" text NOT NULL,
                "category" "question_category" NOT NULL,
                "time_limit" integer NOT NULL,
                "audio_url" text,
                "transcript" text,
                "text_answer" text,
                "duration_seconds" integer,
                "ai_score" integer,
                "ai_notes" text,
                "submitted_at" timestamp,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('✓ Created candidate_responses table');

        // Add job_id column to interviews if not exists
        await client.query(`
            ALTER TABLE "interviews" ADD COLUMN IF NOT EXISTS "job_id" uuid REFERENCES "jobs"("id");
        `);
        console.log('✓ Added job_id to interviews');

        // Add recommendation column to evaluations if not exists
        await client.query(`
            ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "recommendation" text;
        `);
        console.log('✓ Added recommendation to evaluations');

        // Create candidates table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "candidates" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "job_id" uuid NOT NULL REFERENCES "jobs"("id"),
                "name" text NOT NULL,
                "email" text NOT NULL,
                "phone" text,
                "resume_url" text,
                "parsed_resume" jsonb,
                "match_score" integer,
                "match_analysis" jsonb,
                "status" text DEFAULT 'NEW' NOT NULL,
                "interview_id" uuid REFERENCES "interviews"("id"),
                "invited_at" timestamp,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('✓ Created candidates table');

        console.log('\\n✅ All schema updates applied successfully!');

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Schema update failed:', err);
    process.exit(1);
});
