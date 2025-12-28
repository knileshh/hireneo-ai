import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// OpenRouter client - use OpenAI-compatible API with OpenRouter base URL
const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Schema for AI-generated interview questions
 */
export const questionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe('The interview question'),
        category: z.enum(['technical', 'behavioral', 'situational', 'culture_fit']).describe('Category of the question'),
        difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
        expectedAnswer: z.string().optional().describe('Key points for a good answer'),
    })).min(5).max(10),
});

export type GeneratedQuestions = z.infer<typeof questionsSchema>;

/**
 * Generate interview questions based on job role and level
 */
export async function generateInterviewQuestions(
    jobRole: string,
    jobLevel: string,
    interviewId: string
): Promise<GeneratedQuestions> {
    try {
        logger.info({
            interviewId,
            jobRole,
            jobLevel,
        }, 'Generating interview questions');

        const { object } = await generateObject({
            model: openrouter('openai/gpt-4o-mini'),
            schema: questionsSchema,
            prompt: `You are an expert technical recruiter and interviewer. Generate interview questions for the following position:

Job Role: ${jobRole}
Experience Level: ${jobLevel}

Generate 7-8 high-quality interview questions that:
1. Are appropriate for the experience level
2. Mix technical, behavioral, and situational questions
3. Help assess both hard skills and soft skills
4. Are specific to the role, not generic

For each question, specify:
- The question itself
- Category (technical, behavioral, situational, culture_fit)
- Difficulty level (easy, medium, hard)
- Optional: Key points for a good answer`,
            temperature: 0.7,
        });

        logger.info({
            interviewId,
            questionCount: object.questions.length,
        }, 'Interview questions generated successfully');

        return object;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({
            interviewId,
            error: errorMessage,
        }, 'Failed to generate interview questions');
        throw error;
    }
}
