'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type InterviewStatus = 'CREATED' | 'SCHEDULED' | 'COMPLETED' | 'EVALUATION_PENDING' | 'EVALUATED';

interface StatusBadgeProps {
    status: InterviewStatus;
    className?: string;
}

const statusConfig: Record<InterviewStatus, { label: string; className: string }> = {
    CREATED: {
        label: 'Created',
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    },
    SCHEDULED: {
        label: 'Scheduled',
        className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
    },
    COMPLETED: {
        label: 'Completed',
        className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300',
    },
    EVALUATION_PENDING: {
        label: 'Evaluating...',
        className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 animate-pulse',
    },
    EVALUATED: {
        label: 'Evaluated',
        className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900 dark:text-teal-300',
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            variant="outline"
            className={cn(config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
