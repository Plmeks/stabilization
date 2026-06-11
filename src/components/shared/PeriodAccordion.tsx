'use client';

import { ChevronDown } from 'lucide-react';
import { cn, formatPeriodLabel } from '@/lib/utils';
import type { Period } from '@/types';

interface PeriodAccordionProps {
  period: Period;
  isExpanded: boolean;
  onToggle: () => void;
  taskCount: number;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function PeriodAccordion({
  period,
  isExpanded,
  onToggle,
  taskCount,
  children,
  headerActions,
}: PeriodAccordionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 bg-muted/40 cursor-pointer select-none hover:bg-muted/60 transition-colors"
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
        <span className="font-medium text-sm">{formatPeriodLabel(period)}</span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Всего: {taskCount}
        </span>
        {headerActions && (
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </div>
      <div
        className={cn(
          'grid transition-all duration-200',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
