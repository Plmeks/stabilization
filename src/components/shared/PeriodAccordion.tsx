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

function TaskCountBadge({
  taskCount,
  criticalCount,
}: {
  taskCount: number;
  criticalCount?: number;
}) {
  return (
    <span className="w-fit bg-secondary text-muted-foreground text-xs px-2.5 py-0.5 rounded-full shrink-0">
      Всего: <span className="text-foreground">{taskCount}</span>
      {criticalCount !== undefined && criticalCount > 0 ? (
        <>
          {", "}
          Крит: <span className="text-danger">{criticalCount}</span>
        </>
      ) : null}
    </span>
  );
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
  const periodLabel = formatPeriodLabel(period);
  const chevronClassName = cn(
    'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
    isExpanded && 'rotate-180',
  );

  return (
    <div className="panel overflow-hidden">
      <div
        className="hidden sm:flex items-center gap-2 px-5 py-4 bg-muted cursor-pointer select-none hover:bg-secondary transition-colors"
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
      >
        <ChevronDown className={chevronClassName} />
        <span className="text-sm font-medium">{periodLabel}</span>
        <TaskCountBadge taskCount={taskCount} criticalCount={criticalCount} />
        {headerActions && (
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </div>

      <div className="flex sm:hidden gap-2 px-3 py-3 bg-muted">
        <button
          type="button"
          className="flex shrink-0 self-stretch items-start pt-0.5 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Свернуть период' : 'Развернуть период'}
        >
          <ChevronDown className={chevronClassName} />
        </button>
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div
            className="flex flex-col gap-2 cursor-pointer select-none"
            onClick={onToggle}
            role="button"
            aria-expanded={isExpanded}
          >
            <span className="text-sm font-medium leading-snug">{periodLabel}</span>
            <TaskCountBadge taskCount={taskCount} criticalCount={criticalCount} />
          </div>
          {headerActions && (
            <div onClick={(e) => e.stopPropagation()}>{headerActions}</div>
          )}
        </div>
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
