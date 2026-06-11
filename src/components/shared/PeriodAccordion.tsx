'use client';

import { ChevronDown } from 'lucide-react';
import { cn, formatPeriodLabel } from '@/lib/utils';
import type { Period } from '@/types';

interface PeriodAccordionProps {
  period: Period;
  isExpanded: boolean;
  onToggle: () => void;
  taskCount: number;
  criticalCount?: number;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function PeriodAccordion({
  period,
  isExpanded,
  onToggle,
  taskCount,
  criticalCount,
  children,
  headerActions,
}: PeriodAccordionProps) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div
        className="flex items-center gap-2 px-5 py-4 bg-muted/40 cursor-pointer select-none hover:bg-muted/50 transition-colors"
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
        <span className="text-sm font-semibold">{formatPeriodLabel(period)}</span>
        <span className="bg-muted/80 text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
          Всего: {taskCount}{criticalCount !== undefined && criticalCount > 0 ? <>, Крит: <span className="text-red-500">{criticalCount}</span></> : ''}
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
