import * as React from 'react';
import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import type { Task, Period } from '@/types';

interface CurrentTasksRowProps {
	task: Task;
	period: Period | undefined;
	creationPeriod: Period | undefined;
	onEdit: () => void;
	onComplete: () => void;
	onReturnToQA: () => void;
}

export function CurrentTasksRow({ task, creationPeriod, onEdit, onComplete, onReturnToQA }: CurrentTasksRowProps) {
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
			<TableCell className="text-muted-foreground px-4 py-3">
				{task.assignee ?? '—'}
			</TableCell>
			<TableCell className="px-4 py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="px-4 py-3 w-[110px] text-xs text-muted-foreground leading-tight">
				{creationPeriod ? (
					<>
						{dayjs(creationPeriod.start_date).format('DD.MM.YYYY')} -
						<br />
						{dayjs(creationPeriod.end_date).format('DD.MM.YYYY')}
					</>
				) : '—'}
			</TableCell>
			<TableCell className="px-4 py-3">
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell text-muted-foreground px-4 py-3">
				{task.taken_into_work_at
					? dayjs(task.taken_into_work_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="sticky right-0 bg-background z-10 px-4 py-3">
				<ActionButtons onComplete={onComplete} onEdit={onEdit} onReturnToQA={onReturnToQA} />
			</TableCell>
		</TableRow>
	);
}
