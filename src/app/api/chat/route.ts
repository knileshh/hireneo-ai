import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews, evaluations, candidateResponses } from '@/lib/db/schema';
import { eq, ilike, and, desc, sql } from 'drizzle-orm';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// OpenRouter client
const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * POST /api/chat
 * AI Hiring Assistant with streaming and tool calling
 */
export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            // Use a model that properly supports tool calling via OpenRouter
            model: openrouter('anthropic/claude-3.5-haiku'),
            system: `You are an AI Hiring Assistant for HireNeo AI, an interview orchestration platform.
        
Your role is to help recruiters and hiring managers:
- Search and filter candidates
- Compare candidate evaluations
- Provide insights on interview performance
- Answer questions about hiring data

When asked about candidates, use the available tools to query the database.
Be concise and helpful. Format responses with markdown for readability.
When presenting candidate data, use tables or bullet points.`,
            messages,
            tools: {
                searchCandidates: tool({
                    description: 'Search for candidates by name, email, job role, or status',
                    parameters: z.object({
                        query: z.string().optional().describe('Search term for candidate name or email'),
                        jobRole: z.string().optional().describe('Filter by job role'),
                        status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EVALUATION_PENDING', 'EVALUATED']).optional(),
                        limit: z.number().optional().default(10),
                    }),
                    execute: async ({ query, jobRole, status, limit }) => {
                        const conditions = [];

                        if (query) {
                            conditions.push(
                                sql`(${interviews.candidateName} ILIKE ${`%${query}%`} OR ${interviews.candidateEmail} ILIKE ${`%${query}%`})`
                            );
                        }
                        if (jobRole) {
                            conditions.push(ilike(interviews.jobRole, `%${jobRole}%`));
                        }
                        if (status) {
                            conditions.push(eq(interviews.status, status));
                        }

                        const results = await db.query.interviews.findMany({
                            where: conditions.length > 0 ? and(...conditions) : undefined,
                            limit,
                            orderBy: [desc(interviews.scheduledAt)],
                        });

                        // Fetch evaluations for found interviews
                        const data = await Promise.all(results.map(async (interview) => {
                            const evaluation = await db.query.evaluations.findFirst({
                                where: eq(evaluations.interviewId, interview.id),
                            });
                            return {
                                id: interview.id,
                                name: interview.candidateName,
                                email: interview.candidateEmail,
                                jobRole: interview.jobRole,
                                status: interview.status,
                                scheduledAt: interview.scheduledAt,
                                score: evaluation?.score,
                                recommendation: evaluation?.recommendation,
                            };
                        }));

                        return { candidates: data, count: data.length };
                    },
                }),

                getCandidateDetails: tool({
                    description: 'Get detailed information about a specific candidate including their responses',
                    parameters: z.object({
                        candidateId: z.string().describe('The interview/candidate ID'),
                    }),
                    execute: async ({ candidateId }) => {
                        const interview = await db.query.interviews.findFirst({
                            where: eq(interviews.id, candidateId),
                        });

                        if (!interview) {
                            return { error: 'Candidate not found' };
                        }

                        const evaluation = await db.query.evaluations.findFirst({
                            where: eq(evaluations.interviewId, candidateId),
                        });

                        const responses = await db.query.candidateResponses.findMany({
                            where: eq(candidateResponses.interviewId, candidateId),
                            orderBy: (r, { asc }) => [asc(r.questionIndex)],
                        });

                        return {
                            candidate: {
                                name: interview.candidateName,
                                email: interview.candidateEmail,
                                jobRole: interview.jobRole,
                                jobLevel: interview.jobLevel,
                                status: interview.status,
                                scheduledAt: interview.scheduledAt,
                            },
                            evaluation: evaluation ? {
                                score: evaluation.score,
                                summary: evaluation.summary,
                                strengths: evaluation.strengths,
                                risks: evaluation.risks,
                                recommendation: evaluation.recommendation,
                            } : null,
                            responses: responses.map(r => ({
                                question: r.question,
                                category: r.category,
                                answer: r.transcript || r.textAnswer,
                                duration: r.durationSeconds,
                            })),
                        };
                    },
                }),

                getHiringStats: tool({
                    description: 'Get overall hiring statistics and pipeline metrics',
                    parameters: z.object({}),
                    execute: async () => {
                        const allInterviews = await db.query.interviews.findMany();
                        const allEvaluations = await db.query.evaluations.findMany();

                        const statusCounts = allInterviews.reduce((acc, i) => {
                            acc[i.status] = (acc[i.status] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);

                        const scores = allEvaluations.map(e => e.score);
                        const avgScore = scores.length > 0
                            ? scores.reduce((a, b) => a + b, 0) / scores.length
                            : 0;

                        const recommendations = allEvaluations.reduce((acc, e) => {
                            if (e.recommendation) {
                                acc[e.recommendation] = (acc[e.recommendation] || 0) + 1;
                            }
                            return acc;
                        }, {} as Record<string, number>);

                        return {
                            totalInterviews: allInterviews.length,
                            evaluatedCount: allEvaluations.length,
                            averageScore: avgScore.toFixed(1),
                            statusBreakdown: statusCounts,
                            recommendations,
                        };
                    },
                }),

                compareTopCandidates: tool({
                    description: 'Compare the top candidates by evaluation score for a specific role',
                    parameters: z.object({
                        jobRole: z.string().optional().describe('Filter by job role'),
                        limit: z.number().optional().default(5),
                    }),
                    execute: async ({ jobRole, limit }) => {
                        const conditions = [];
                        if (jobRole) {
                            conditions.push(ilike(interviews.jobRole, `%${jobRole}%`));
                        }
                        conditions.push(eq(interviews.status, 'EVALUATED'));

                        const evaluated = await db.query.interviews.findMany({
                            where: and(...conditions),
                        });

                        const withScores = await Promise.all(evaluated.map(async (interview) => {
                            const evaluation = await db.query.evaluations.findFirst({
                                where: eq(evaluations.interviewId, interview.id),
                            });
                            return {
                                name: interview.candidateName,
                                jobRole: interview.jobRole,
                                score: evaluation?.score || 0,
                                recommendation: evaluation?.recommendation,
                                strengths: evaluation?.strengths?.slice(0, 2),
                            };
                        }));

                        return {
                            topCandidates: withScores
                                .sort((a, b) => b.score - a.score)
                                .slice(0, limit),
                        };
                    },
                }),
            },
            maxSteps: 5, // Allow multiple tool calls if needed
        });

        return result.toDataStreamResponse();
    } catch (error) {
        logger.error({ err: error }, 'Chat API error');
        return new Response(JSON.stringify({ error: 'Chat failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
