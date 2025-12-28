export type InterviewStatus =
    | 'CREATED'
    | 'SCHEDULED'
    | 'COMPLETED'
    | 'EVALUATION_PENDING'
    | 'EVALUATED';

// Valid state transitions (explicit state machine)
const VALID_TRANSITIONS: Record<InterviewStatus, InterviewStatus[]> = {
    CREATED: ['SCHEDULED'],
    SCHEDULED: ['COMPLETED'],
    COMPLETED: ['EVALUATION_PENDING'],
    EVALUATION_PENDING: ['EVALUATED'],
    EVALUATED: [] // Terminal state
};

/**
 * Custom error for invalid state transitions
 */
export class InvalidTransitionError extends Error {
    constructor(from: InterviewStatus, to: InterviewStatus) {
        super(`Invalid state transition from "${from}" to "${to}"`);
        this.name = 'InvalidTransitionError';
    }
}

/**
 * Validates and performs a state transition
 * @throws {InvalidTransitionError} if transition is not allowed
 */
export function transitionStatus(
    current: InterviewStatus,
    next: InterviewStatus
): InterviewStatus {
    const allowedTransitions = VALID_TRANSITIONS[current];

    if (!allowedTransitions.includes(next)) {
        throw new InvalidTransitionError(current, next);
    }

    return next;
}

/**
 * Checks if a transition is valid without throwing
 */
export function canTransition(
    current: InterviewStatus,
    next: InterviewStatus
): boolean {
    return VALID_TRANSITIONS[current].includes(next);
}
