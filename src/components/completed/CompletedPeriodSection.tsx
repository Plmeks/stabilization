'use client';

import PeriodAccordion from '@/components/shared/PeriodAccordion';
import { CompletedTasksTable } from './CompletedTasksTable';
import type { Task, Period } from '@/types';

interface CompletedPeriodSectionProps {
	period: Period;
	tasks: Task[];
	periods: Period[];
	isExpanded: boolean;
	onToggle: () => void;
	onEdit: (task: Task) => void;
	onReturnToQA: (taskId: string) => void;
}

export function CompletedPeriodSection({
	period,
	tasks,
	periods,
	isExpanded,
	onToggle,
	onEdit,
	onReturnToQA,
}: CompletedPeriodSectionProps) {
	const criticalCount = tasks.filter((t) => t.priority === 'Авария').length;

	return (
		<PeriodAccordion
			period={period}
			isExpanded={isExpanded}
			onToggle={onToggle}
			taskCount={tasks.length}
			criticalCount={criticalCount}
		>
			<CompletedTasksTable
				tasks={tasks}
				periods={periods}
				onEdit={onEdit}
				onReturnToQA={onReturnToQA}
			/>
		</PeriodAccordion>
	);
}
