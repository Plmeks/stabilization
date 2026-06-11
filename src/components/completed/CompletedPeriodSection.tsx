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
	onDelete: (taskId: string) => void;
}

export function CompletedPeriodSection({
	period,
	tasks,
	periods,
	isExpanded,
	onToggle,
	onEdit,
	onDelete,
}: CompletedPeriodSectionProps) {
	return (
		<PeriodAccordion
			period={period}
			isExpanded={isExpanded}
			onToggle={onToggle}
			taskCount={tasks.length}
		>
			<CompletedTasksTable
				tasks={tasks}
				periods={periods}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		</PeriodAccordion>
	);
}
