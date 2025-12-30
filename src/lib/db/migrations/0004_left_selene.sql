ALTER TABLE "assessment_tokens" DROP CONSTRAINT "assessment_tokens_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "candidate_responses" DROP CONSTRAINT "candidate_responses_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_questions" DROP CONSTRAINT "interview_questions_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "scorecards" DROP CONSTRAINT "scorecards_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "candidates" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_tokens" ADD CONSTRAINT "assessment_tokens_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_responses" ADD CONSTRAINT "candidate_responses_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;