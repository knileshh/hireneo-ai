import { describe, it, expect } from 'vitest';
import {
    transitionStatus,
    canTransition,
    InvalidTransitionError,
    type InterviewStatus,
} from '../../lib/domain/interview-state-machine';

describe('Interview State Machine', () => {
    describe('Valid Transitions', () => {
        it('should allow CREATED → SCHEDULED', () => {
            const result = transitionStatus('CREATED', 'SCHEDULED');
            expect(result).toBe('SCHEDULED');
        });

        it('should allow SCHEDULED → COMPLETED', () => {
            const result = transitionStatus('SCHEDULED', 'COMPLETED');
            expect(result).toBe('COMPLETED');
        });

        it('should allow COMPLETED → EVALUATION_PENDING', () => {
            const result = transitionStatus('COMPLETED', 'EVALUATION_PENDING');
            expect(result).toBe('EVALUATION_PENDING');
        });

        it('should allow EVALUATION_PENDING → EVALUATED', () => {
            const result = transitionStatus('EVALUATION_PENDING', 'EVALUATED');
            expect(result).toBe('EVALUATED');
        });
    });

    describe('Invalid Transitions', () => {
        it('should reject CREATED → COMPLETED', () => {
            expect(() => {
                transitionStatus('CREATED', 'COMPLETED');
            }).toThrow(InvalidTransitionError);
        });

        it('should reject SCHEDULED → EVALUATED', () => {
            expect(() => {
                transitionStatus('SCHEDULED', 'EVALUATED');
            }).toThrow(InvalidTransitionError);
        });

        it('should reject EVALUATED → any state (terminal)', () => {
            expect(() => {
                transitionStatus('EVALUATED', 'COMPLETED');
            }).toThrow(InvalidTransitionError);
        });

        it('should throw meaningful error message', () => {
            expect(() => {
                transitionStatus('CREATED', 'EVALUATED');
            }).toThrow('Invalid state transition from "CREATED" to "EVALUATED"');
        });
    });

    describe('canTransition helper', () => {
        it('should return true for valid transitions', () => {
            expect(canTransition('CREATED', 'SCHEDULED')).toBe(true);
            expect(canTransition('SCHEDULED', 'COMPLETED')).toBe(true);
        });

        it('should return false for invalid transitions', () => {
            expect(canTransition('CREATED', 'COMPLETED')).toBe(false);
            expect(canTransition('EVALUATED', 'SCHEDULED')).toBe(false);
        });
    });

    describe('Terminal State', () => {
        it('should not allow any transitions from EVALUATED', () => {
            const states: InterviewStatus[] = ['CREATED', 'SCHEDULED', 'COMPLETED', 'EVALUATION_PENDING'];

            states.forEach(state => {
                expect(canTransition('EVALUATED', state)).toBe(false);
            });
        });
    });
});
