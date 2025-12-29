import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '@/lib/env';

// OpenRouter client - use OpenAI-compatible API with OpenRouter base URL
const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// Schema for parsed resume data
const ResumeSchema = z.object({
    summary: z.string().describe('A brief professional summary of the candidate'),
    skills: z.array(z.string()).describe('List of technical and soft skills'),
    experience: z.array(
        z.object({
            company: z.string(),
            role: z.string(),
            duration: z.string(),
            description: z.string(),
        })
    ).describe('Work experience history'),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            year: z.string(),
        })
    ).describe('Educational background'),
    certifications: z.array(z.string()).describe('Professional certifications'),
});

export type ParsedResume = z.infer<typeof ResumeSchema>;

/**
 * Parse resume text using AI to extract structured data
 * @param resumeText - Raw text from resume
 * @returns Structured resume data
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
    try {
        const { object } = await generateObject({
            model: openrouter('openai/gpt-4o-mini'),
            schema: ResumeSchema,
            prompt: `You are an expert resume parser. Extract structured information from the provided resume text.

Extract:
- A professional summary (2-3 sentences)
- All technical and soft skills mentioned
- Work experience with company, role, duration, and key responsibilities
- Educational background with institution, degree, and year
- Professional certifications

Be thorough but concise. If information is missing, provide empty arrays or reasonable defaults.

Resume Text:
${resumeText}`,
            temperature: 0.2, // Lower temperature for consistent parsing
        });

        return object;
    } catch (error) {
        console.error('AI resume parsing error:', error);
        throw new Error('Failed to parse resume with AI');
    }
}

