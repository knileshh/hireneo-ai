import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// Create OpenRouter-compatible client
// OpenRouter uses OpenAI-compatible API with a different base URL
const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Schema for AI-generated interview evaluation
 */
export const evaluationSchema = z.object({
    score: z.number().min(1).max(10).describe('Overall interview score from 1-10'),
    summary: z.string().describe('Brief summary of the interview performance'),
    strengths: z.array(z.string()).describe('List of candidate strengths observed'),
    risks: z.array(z.string()).describe('List of potential concerns or risks')
});

export type AIEvaluation = z.infer<typeof evaluationSchema>;

/**
 * Custom error class for AI evaluation failures
 */
export class AIEvaluationError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message);
        this.name = 'AIEvaluationError';
    }
}

/**
 * Generate AI-powered interview evaluation from notes
 */
export async function generateInterviewEvaluation(
    notes: string,
    interviewId: string
): Promise<AIEvaluation> {
    try {
        logger.info('Starting AI interview evaluation', {
            interviewId,
            noteLength: notes.length
        });

        // Use a model available on OpenRouter (e.g., GPT-4o or Claude)
        const { object } = await generateObject({
            model: openrouter('openai/gpt-4o'),
            schema: evaluationSchema,
            prompt: `You are an expert technical interviewer. Evaluate this interview based on the notes below.

Provide:
1. A score from 1-10 (where 10 is exceptional)
2. A brief summary of the candidate's performance
3. A list of key strengths demonstrated
4. A list of potential risks or concerns

Be objective, constructive, and specific in your evaluation.

Interview Notes:
${notes}`,
            temperature: 0.3 // Lower temperature for more consistent evaluations
        });

        logger.info('AI evaluation generated successfully', {
            interviewId,
            score: object.score,
            strengthsCount: object.strengths.length,
            risksCount: object.risks.length
        });

        return object;

    } catch (error: any) {
        logger.error('AI evaluation failed', {
            interviewId,
            error: error.message,
            errorType: error.name,
            errorCode: error.code
        });

        // Check for specific API errors
        if (error.code === 'insufficient_quota') {
            throw new AIEvaluationError(
                'API quota exceeded. Please check your billing.',
                error
            );
        }

        if (error.code === 'invalid_api_key') {
            throw new AIEvaluationError(
                'Invalid API key. Please check your configuration.',
                error
            );
        }

        throw new AIEvaluationError(
            `Failed to generate evaluation: ${error.message}`,
            error
        );
    }
}
