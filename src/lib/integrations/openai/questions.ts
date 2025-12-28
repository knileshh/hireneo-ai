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
        category: z.enum(['personal', 'behavioral', 'technical']).describe('Category of the question'),
        difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
        timeLimit: z.number().describe('Time limit in seconds (120 for personal, 180 for behavioral, 240 for technical)'),
        expectedAnswer: z.string().describe('Key points for a good answer'),
    })).min(6).max(10),
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
            prompt: `You are an expert technical recruiter. Generate interview questions for a candidate assessment.

Job Role: ${jobRole}
Experience Level: ${jobLevel}

Generate exactly 8 questions with this distribution:
- 2 Personal questions (about background, motivation, career goals)
- 3 Behavioral questions (past experiences, problem-solving, teamwork)
- 3 Technical questions (role-specific skills and knowledge)

Time limits by category:
- personal: 120 seconds (2 minutes)
- behavioral: 180 seconds (3 minutes)  
- technical: 240 seconds (4 minutes)

Requirements:
1. Questions should be appropriate for the experience level
2. Technical questions should be specific to ${jobRole}
3. Start with easier questions and progress to harder ones
4. Include a mix of difficulties (easy, medium, hard)

For each question provide:
- The question itself (clear and concise)
- Category (personal, behavioral, or technical)
- Difficulty (easy, medium, hard)
- Time limit in seconds
- Key points expected in a good answer`,
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
