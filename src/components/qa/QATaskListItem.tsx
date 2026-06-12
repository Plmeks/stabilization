'use client';

import { Pencil, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { TaskTitle } from '@/components/shared/TaskTitle';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import type { Task } from '@/types';

interface QATaskListItemProps {
	task: Task;
	onTakeIntoWork: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	onEdit: (task: Task) => void;
}

export function QATaskListItem({ task, onTakeIntoWork, onDelete, onEdit }: QATaskListItemProps) {
	const canTakeIntoWork = task.status === null;

	return (
		<div className={`flex items-center gap-2 px-4 py-2.5 border-t${task.status !== null ? ' bg-blue-50' : ''}`}>
			{task.link ? (
			<a href={task.link} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline break-all">
				{task.title}
			</a>
		) : (
			<TaskTitle title={task.title} className="flex-1 text-sm" />
		)}
			{task.priority === 'Критический' && <PriorityBadge priority={task.priority} />}
			<div className="flex items-center gap-1 ml-auto shrink-0">
				{canTakeIntoWork && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Взять в работу"
						onClick={() => onTakeIntoWork(task.id)}
					>
						<Play className="h-4 w-4" />
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => onEdit(task)}
					aria-label="Редактировать"
				>
					<Pencil className="h-4 w-4" />
				</Button>
				<ActionButtons onDelete={() => onDelete(task.id)} />
			</div>
		</div>
	);
}
