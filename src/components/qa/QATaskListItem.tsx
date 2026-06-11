'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { TaskTitle } from '@/components/shared/TaskTitle';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Task } from '@/types';

interface QATaskListItemProps {
	task: Task;
	onTakeIntoWork: (task: Task) => void;
	onDelete: (taskId: string) => void;
}

export function QATaskListItem({ task, onTakeIntoWork, onDelete }: QATaskListItemProps) {
	const isTaken = task.taken_into_work_at !== null;

	return (
		<div
			className={cn(
				'flex items-center gap-2 px-4 py-2.5 border-t',
				isTaken && 'bg-blue-50',
			)}
		>
			<TaskTitle title={task.title} className="flex-1 text-sm" />
			<PriorityBadge priority={task.priority} />
			<StatusBadge status={task.status} />
			<div className="flex items-center gap-1 ml-auto shrink-0">
				{!isTaken && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onTakeIntoWork(task)}
					>
						Взять в работу
					</Button>
				)}
				<ActionButtons onDelete={() => onDelete(task.id)} />
			</div>
		</div>
	);
}
