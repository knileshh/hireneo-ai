
import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function resetDb() {
    console.log("⚠️  TRUNCATING ALL TABLES...");
    try {
        // Disable triggers/constraints temporarily if needed, or just cascade
        await db.execute(sql`TRUNCATE TABLE candidate_responses, assessment_tokens, evaluations, interview_questions, scorecards, candidates, interviews, jobs CASCADE;`);
        console.log("✅ Database reset complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to reset DB:", error);
        process.exit(1);
    }
}

resetDb();
