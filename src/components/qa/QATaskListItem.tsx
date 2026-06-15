'use client';

import { Pencil, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { TaskNameWithComment } from '@/components/shared/TaskNameWithComment';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import type { Task } from '@/types';

interface QATaskListItemProps {
	task: Task;
	onTakeIntoWork: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	onEdit: (task: Task) => void;
	onOpenComment: (task: Task) => void;
}

export function QATaskListItem({ task, onTakeIntoWork, onDelete, onEdit, onOpenComment }: QATaskListItemProps) {
	const canTakeIntoWork = task.status === null;

	return (
		<div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-t${task.status !== null ? ' bg-blue-50' : ''}`}>
			<TaskNameWithComment
				task={task}
				onOpenComment={() => onOpenComment(task)}
				className="flex-1 text-sm"
				titleClassName="text-sm"
				linkClassName="text-sm break-all"
			/>
			{task.priority === 'Критический' && <PriorityBadge priority={task.priority} />}
			<div className="flex items-center gap-1 ml-auto shrink-0">
				{canTakeIntoWork && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer text-green-500 hover:text-green-500"
						aria-label="Взять в работу"
						title="Взять в работу"
						onClick={() => onTakeIntoWork(task.id)}
					>
						<Rocket className="h-4 w-4" />
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer text-amber-500 hover:text-amber-500"
					onClick={() => onEdit(task)}
					aria-label="Редактировать"
					title="Редактировать"
				>
					<Pencil className="h-4 w-4" />
				</Button>
				<ActionButtons onDelete={() => onDelete(task.id)} />
			</div>
		</div>
	);
}
