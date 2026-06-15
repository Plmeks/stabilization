'use client';

import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PeriodAccordion from '@/components/shared/PeriodAccordion';
import { QATaskListItem } from '@/components/qa/QATaskListItem';
import type { Period, Task } from '@/types';

interface QAPeriodSectionProps {
	period: Period;
	tasks: Task[];
	isExpanded: boolean;
	onToggle: () => void;
	onAddTask: (periodId: string) => void;
	onDeletePeriod: (periodId: string) => void;
	onTakeIntoWork: (taskId: string) => void;
	onDeleteTask: (taskId: string) => void;
	onEdit: (task: Task) => void;
	onOpenComment: (task: Task) => void;
	totalTaskCount: number;
	criticalCount: number;
}

export function QAPeriodSection({
	period,
	tasks,
	isExpanded,
	onToggle,
	onAddTask,
	onDeletePeriod,
	onTakeIntoWork,
	onDeleteTask,
	onEdit,
	onOpenComment,
	totalTaskCount,
	criticalCount,
}: QAPeriodSectionProps) {
	const addTaskButton = (
		<Button
			variant="outline"
			size="sm"
			className="w-full sm:w-auto"
			onClick={() => onAddTask(period.id)}
		>
			<Plus className="h-3.5 w-3.5 mr-1" />
			Добавить задачу
		</Button>
	);

	const deletePeriodButton = (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
			onClick={() => onDeletePeriod(period.id)}
			aria-label="Удалить период"
		>
			<Trash2 className="h-4 w-4" />
		</Button>
	);

	const headerActions = (
		<div className="flex w-full items-center gap-2 sm:w-auto sm:gap-1">
			<div className="min-w-0 flex-1 sm:flex-initial">{addTaskButton}</div>
			{deletePeriodButton}
		</div>
	);

	return (
		<PeriodAccordion
			period={period}
			isExpanded={isExpanded}
			onToggle={onToggle}
			taskCount={totalTaskCount}
			criticalCount={criticalCount}
			headerActions={headerActions}
		>
			{tasks.length === 0 ? (
				<p className="px-4 py-3 text-sm text-muted-foreground">Нет задач</p>
			) : (
				tasks.map((task) => (
					<QATaskListItem
						key={task.id}
						task={task}
						onTakeIntoWork={onTakeIntoWork}
						onDelete={onDeleteTask}
						onEdit={onEdit}
						onOpenComment={onOpenComment}
					/>
				))
			)}
		</PeriodAccordion>
	);
}
