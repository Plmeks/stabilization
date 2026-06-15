'use client';

import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TaskNameWithComment } from '@/components/shared/TaskNameWithComment';
import type { Task, Period } from '@/types';

interface CompletedTasksRowProps {
	task: Task;
	period: Period | undefined;
	creationPeriod: Period | undefined;
	onEdit: () => void;
	onReturnToQA: () => void;
	onOpenComment: () => void;
}

export function CompletedTasksRow({ task, creationPeriod, onEdit, onReturnToQA, onOpenComment }: CompletedTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="whitespace-normal px-2 py-2 md:px-4 md:py-3">
				<TaskNameWithComment task={task} onOpenComment={onOpenComment} />
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3 whitespace-normal">
				{task.assignee ?? '—'}
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3">
				{creationPeriod ? (
					<>
						{dayjs(creationPeriod.start_date).format('DD.MM.YYYY')} -
						<br />
						{dayjs(creationPeriod.end_date).format('DD.MM.YYYY')}
					</>
				) : '—'}
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3">
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3">
				{task.completed_at !== null
					? dayjs(task.completed_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3">
				{task.version ?? '—'}
			</TableCell>
			<TableCell className="sticky right-0 bg-background z-10 px-2 py-2 md:px-4 md:py-3">
				<ActionButtons onEdit={onEdit} onReturnToQA={onReturnToQA} />
			</TableCell>
		</TableRow>
	);
}
