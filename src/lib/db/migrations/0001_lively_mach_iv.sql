CREATE TYPE "public"."question_category" AS ENUM('personal', 'behavioral', 'technical');--> statement-breakpoint
ALTER TYPE "public"."interview_status" ADD VALUE 'IN_PROGRESS' BEFORE 'COMPLETED';--> statement-breakpoint
CREATE TABLE "assessment_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_tokens_interview_id_unique" UNIQUE("interview_id"),
	CONSTRAINT "assessment_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "candidate_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "jobs" (
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
--> statement-breakpoint
ALTER TABLE "evaluations" ADD COLUMN "recommendation" text;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "job_id" uuid;--> statement-breakpoint
ALTER TABLE "assessment_tokens" ADD CONSTRAINT "assessment_tokens_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_responses" ADD CONSTRAINT "candidate_responses_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;