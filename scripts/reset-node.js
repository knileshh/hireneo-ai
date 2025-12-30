
const { Pool } = require('pg');
require('dotenv').config();

async function reset() {
    console.log('Connecting to DB...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Truncating tables...');
        await pool.query('TRUNCATE TABLE candidate_responses, assessment_tokens, evaluations, interview_questions, scorecards, candidates, interviews, jobs CASCADE');
        console.log('✅ Tables truncated.');
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

reset();
