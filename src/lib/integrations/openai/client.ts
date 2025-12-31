import { generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { openrouter, MODEL_CONFIG, TEMPERATURE } from '@/lib/ai/config';

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
        logger.info({
            interviewId,
            noteLength: notes.length
        }, 'Starting AI interview evaluation');

        const { object } = await generateObject({
            model: openrouter(MODEL_CONFIG.interviewEvaluation),
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
            temperature: TEMPERATURE.extraction,
        });

        logger.info({
            interviewId,
            score: object.score,
            strengthsCount: object.strengths.length,
            risksCount: object.risks.length
        }, 'AI evaluation generated successfully');

        return object;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorName = error instanceof Error ? error.name : 'UnknownError';
        const errorCode = (error as { code?: string })?.code;

        logger.error({
            interviewId,
            error: errorMessage,
            errorType: errorName,
            errorCode
        }, 'AI evaluation failed');

        // Check for specific API errors
        if (errorCode === 'insufficient_quota') {
            throw new AIEvaluationError(
                'API quota exceeded. Please check your billing.',
                error
            );
        }

        if (errorCode === 'invalid_api_key') {
            throw new AIEvaluationError(
                'Invalid API key. Please check your configuration.',
                error
            );
        }

        throw new AIEvaluationError(
            `Failed to generate evaluation: ${errorMessage}`,
            error
        );
    }
}
