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
	const headerActions = (
		<div className="flex items-center gap-1">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onAddTask(period.id)}
			>
				<Plus className="h-3.5 w-3.5 mr-1" />
				Добавить задачу
			</Button>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-destructive hover:text-destructive"
				onClick={() => onDeletePeriod(period.id)}
				aria-label="Удалить период"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
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
