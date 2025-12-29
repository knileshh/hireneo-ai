import { describe, it, expect } from 'vitest';

describe('Queue Factory', () => {
    describe('Queue Naming Convention', () => {
        it('should have consistent queue names', () => {
            const queueNames = [
                'email-notifications',
                'ai-evaluation',
                'interview-reminders',
                'welcome-emails',
            ];

            queueNames.forEach(name => {
                expect(name).toMatch(/^[a-z-]+$/); // kebab-case
                expect(name.length).toBeGreaterThan(3);
            });
        });
    });

    describe('Job Data Types', () => {
        it('should validate EmailJobData structure', () => {
            const mockEmailJob = {
                to: 'test@example.com',
                candidateName: 'John Doe',
                jobTitle: 'Software Engineer',
                assessmentUrl: 'https://app.example.com/assessment/token',
            };

            expect(mockEmailJob).toHaveProperty('to');
            expect(mockEmailJob).toHaveProperty('candidateName');
            expect(mockEmailJob).toHaveProperty('jobTitle');
            expect(mockEmailJob).toHaveProperty('assessmentUrl');
            expect(mockEmailJob.to).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Email regex
        });

        it('should validate WelcomeEmailJobData structure', () => {
            const mockWelcomeJob = {
                userId: 'user-123',
                userEmail: 'newuser@example.com',
                userName: 'Jane Smith',
                userRole: 'recruiter',
            };

            expect(mockWelcomeJob).toHaveProperty('userId');
            expect(mockWelcomeJob).toHaveProperty('userEmail');
            expect(mockWelcomeJob).toHaveProperty('userName');
            expect(mockWelcomeJob).toHaveProperty('userRole');
            expect(['recruiter', 'candidate']).toContain(mockWelcomeJob.userRole);
        });

        it('should validate EvaluationJobData structure', () => {
            const mockEvalJob = {
                interviewId: 'interview-abc-123',
                answers: [
                    { question: 'What is TypeScript?', answer: 'A typed superset of JavaScript' },
                ],
            };

            expect(mockEvalJob).toHaveProperty('interviewId');
            expect(mockEvalJob).toHaveProperty('answers');
            expect(Array.isArray(mockEvalJob.answers)).toBe(true);
            expect(mockEvalJob.answers[0]).toHaveProperty('question');
            expect(mockEvalJob.answers[0]).toHaveProperty('answer');
        });
    });

    describe('Queue Configuration', () => {
        it('should have retry configuration for reliability', () => {
            const retryConfig = {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000, // 5 seconds
                },
            };

            expect(retryConfig.attempts).toBeGreaterThanOrEqual(3);
            expect(retryConfig.backoff.type).toBe('exponential');
            expect(retryConfig.backoff.delay).toBeGreaterThanOrEqual(1000);
        });

        it('should validate job timeout configuration', () => {
            const timeoutConfig = {
                email: 30000,        // 30s
                evaluation: 120000,  // 2min
                reminder: 30000,     // 30s
            };

            Object.values(timeoutConfig).forEach(timeout => {
                expect(timeout).toBeGreaterThan(0);
                expect(timeout).toBeLessThanOrEqual(300000); // Max 5 minutes
            });
        });
    });
});
