import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils - cn() function', () => {
    it('should merge multiple class names', () => {
        const result = cn('px-4', 'py-2', 'bg-blue-500');
        expect(result).toContain('px-4');
        expect(result).toContain('py-2');
        expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('btn', isActive && 'active');
        expect(result).toContain('btn');
        expect(result).toContain('active');
    });

    it('should ignore false/null/undefined values', () => {
        const result = cn('btn', false, null, undefined, 'enabled');
        expect(result).toContain('btn');
        expect(result).toContain('enabled');
        expect(result).not.toContain('false');
        expect(result).not.toContain('null');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
        // Later classes should override earlier ones
        const result = cn('p-4', 'p-8');
        expect(result).toBe('p-8');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle array inputs', () => {
        const result = cn(['btn', 'active'], 'large');
        expect(result).toContain('btn');
        expect(result).toContain('active');
        expect(result).toContain('large');
    });

    it('should handle object inputs with boolean values', () => {
        const result = cn({
            'btn': true,
            'disabled': false,
            'active': true,
        });
        expect(result).toContain('btn');
        expect(result).toContain('active');
        expect(result).not.toContain('disabled');
    });
});
