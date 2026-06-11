'use client';

import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Task, Period } from '@/types';

interface CompletedTasksRowProps {
	task: Task;
	period: Period | undefined;
	onEdit: () => void;
	onReturnToQA: () => void;
}

export function CompletedTasksRow({ task, onEdit, onReturnToQA }: CompletedTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="whitespace-normal px-4 py-3">
				<div className="break-words overflow-hidden">
					{task.link ? (
						<a
							href={task.link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline"
						>
							{task.title}
						</a>
					) : (
						task.title
					)}
				</div>
			</TableCell>
			<TableCell className="px-4 py-3">{task.assignee ?? '—'}</TableCell>
			<TableCell className="px-4 py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="px-4 py-3">
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell px-4 py-3">
				{task.completed_at !== null
					? dayjs(task.completed_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="sticky right-0 bg-background z-10 px-4 py-3">
				<ActionButtons onEdit={onEdit} onReturnToQA={onReturnToQA} />
			</TableCell>
		</TableRow>
	);
}
