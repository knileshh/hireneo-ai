CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"resume_url" text,
	"parsed_resume" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "user_id" text NOT NULL;