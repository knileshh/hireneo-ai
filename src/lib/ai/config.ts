/**
 * Centralized AI Configuration for OpenRouter
 * 
 * All AI operations use OpenRouter as the gateway.
 * Models selected for optimal cost/performance balance.
 * 
 * Pricing (as of Dec 2024):
 * - gpt-4o-mini: $0.15/M input, $0.60/M output (CHEAPEST)
 * - claude-3.5-haiku: $0.80/M input, $4.00/M output
 * - gpt-4o: $2.50/M input, $10.00/M output (premium)
 */

import { createOpenAI } from '@ai-sdk/openai';
import { env } from '@/lib/env';

// OpenRouter client - uses OpenAI-compatible API
export const openrouter = createOpenAI({
    apiKey: env.OPENAI_API_KEY, // This is your OPENROUTER_API_KEY
    baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Model Selection Strategy:
 * 
 * - FAST_CHEAP: Quick operations, high volume (resume parsing, scoring)
 * - BALANCED: Good quality at reasonable cost (evaluation, questions)
 * - PREMIUM: Complex reasoning tasks (reserved for future use)
 */
export const AI_MODELS = {
    // GPT-4o-mini: Best cost/performance ratio for most tasks
    FAST_CHEAP: 'openai/gpt-4o-mini',        // $0.15/M in, $0.60/M out

    // GPT-4o-mini: Also good for balanced tasks
    BALANCED: 'openai/gpt-4o-mini',          // Same as above

    // GPT-4o: Premium for complex tasks (optional upgrade)
    PREMIUM: 'openai/gpt-4o',                // $2.50/M in, $10.00/M out
} as const;

/**
 * Default model for each operation type
 */
export const MODEL_CONFIG = {
    resumeParsing: AI_MODELS.FAST_CHEAP,     // High volume, structured extraction
    candidateScoring: AI_MODELS.FAST_CHEAP,  // Frequent operation
    questionGeneration: AI_MODELS.BALANCED,  // Quality matters
    interviewEvaluation: AI_MODELS.BALANCED, // Quality matters
} as const;

/**
 * Temperature settings for different operations
 */
export const TEMPERATURE = {
    extraction: 0.3,    // Low for accurate parsing
    scoring: 0.4,       // Slightly higher for nuanced evaluation
    generation: 0.7,    // Creative for question generation
} as const;
