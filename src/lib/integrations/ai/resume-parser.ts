import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// OpenRouter client
const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// ============ SCHEMAS ============

export const parsedResumeSchema = z.object({
    name: z.string().describe('Full name extracted from resume'),
    email: z.string().email().describe('Email address'),
    phone: z.string().optional().describe('Phone number if present'),
    summary: z.string().describe('Professional summary/objective'),
    skills: z.array(z.string()).describe('List of technical and soft skills'),
    experience: z.array(z.object({
        company: z.string(),
        role: z.string(),
        duration: z.string(),
        description: z.string(),
    })).describe('Work experience entries'),
    education: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        year: z.string(),
    })).describe('Educational background'),
    certifications: z.array(z.string()).optional().describe('Certifications if any'),
    yearsOfExperience: z.number().describe('Estimated total years of experience'),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;

export const matchAnalysisSchema = z.object({
    matchScore: z.number().min(0).max(100).describe('Overall match score 0-100'),
    strengths: z.array(z.string()).describe('Key strengths matching the job requirements'),
    gaps: z.array(z.string()).describe('Missing skills or experience gaps'),
    recommendation: z.enum(['strong_match', 'good_match', 'potential_match', 'weak_match'])
        .describe('Overall hiring recommendation'),
    summary: z.string().describe('Brief analysis summary'),
});

export type MatchAnalysis = z.infer<typeof matchAnalysisSchema>;

// ============ FUNCTIONS ============

/**
 * Parse resume text using AI to extract structured data
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
    try {
        logger.info('Parsing resume with AI');

        const { object } = await generateObject({
            model: openrouter('anthropic/claude-3.5-haiku'),
            schema: parsedResumeSchema,
            prompt: `Extract structured information from this resume. Be thorough in identifying skills, experience, and education.

RESUME CONTENT:
${resumeText}

INSTRUCTIONS:
1. Extract the candidate's full name and contact information
2. Identify all technical and soft skills mentioned
3. Parse work experience with company names, roles, durations, and key responsibilities
4. Extract educational background
5. List any certifications
6. Estimate total years of professional experience

If certain information is not present, provide reasonable defaults or empty arrays.`,
            temperature: 0.3, // Low temperature for accurate extraction
        });

        logger.info({ name: object.name }, 'Resume parsed successfully');
        return object;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to parse resume');
        throw new Error(`Resume parsing failed: ${errorMessage}`);
    }
}

/**
 * Score candidate resume against job requirements
 */
export async function scoreCandidate(
    parsedResume: ParsedResume,
    jobTitle: string,
    jobRequirements: string[],
    jobLevel: string
): Promise<MatchAnalysis> {
    try {
        logger.info({
            candidateName: parsedResume.name,
            jobTitle
        }, 'Scoring candidate against job');

        const { object } = await generateObject({
            model: openrouter('anthropic/claude-3.5-haiku'),
            schema: matchAnalysisSchema,
            prompt: `Analyze how well this candidate matches the job requirements. Provide an objective, unbiased assessment.

JOB DETAILS:
- Title: ${jobTitle}
- Level: ${jobLevel}
- Requirements: ${jobRequirements.join(', ')}

CANDIDATE PROFILE:
- Name: ${parsedResume.name}
- Years of Experience: ${parsedResume.yearsOfExperience}
- Skills: ${parsedResume.skills.join(', ')}
- Experience Summary: ${parsedResume.experience.map(e => `${e.role} at ${e.company} (${e.duration})`).join('; ')}
- Education: ${parsedResume.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}

SCORING GUIDELINES:
- 90-100: Perfect match - exceeds most requirements, ideal candidate
- 75-89: Strong match - meets all critical requirements  
- 60-74: Good match - meets most requirements with minor gaps
- 45-59: Potential match - meets some requirements, significant growth needed
- 0-44: Weak match - major gaps in requirements

Be objective and do NOT consider:
- Company prestige/brand names
- University rankings
- Personal demographics

Focus ONLY on:
- Skill alignment with requirements
- Relevant experience level
- Technical competency signals`,
            temperature: 0.4,
        });

        logger.info({
            candidateName: parsedResume.name,
            matchScore: object.matchScore
        }, 'Candidate scored successfully');

        return object;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage }, 'Failed to score candidate');
        throw new Error(`Candidate scoring failed: ${errorMessage}`);
    }
}

/**
 * Extract text from PDF buffer (placeholder - in production use pdf-parse or similar)
 * For now, we'll accept plain text or handle PDF parsing on the client side
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Simple implementation - try to decode as UTF-8 text
    // In production, use pdf-parse library
    const text = buffer.toString('utf-8');

    // If it looks like PDF binary, throw error
    if (text.startsWith('%PDF')) {
        throw new Error('PDF parsing not yet implemented. Please paste resume text directly.');
    }

    return text;
}
