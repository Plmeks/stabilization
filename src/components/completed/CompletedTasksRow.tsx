'use client';

import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PeriodBadge } from '@/components/shared/PeriodBadge';
import type { Task, Period } from '@/types';

interface CompletedTasksRowProps {
	task: Task;
	period: Period | undefined;
	onEdit: () => void;
	onReturnToQA: () => void;
}

export function CompletedTasksRow({ task, period, onEdit, onReturnToQA }: CompletedTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="max-w-xs break-all py-3">
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
			</TableCell>
			<TableCell className="py-3">{task.assignee ?? '—'}</TableCell>
			<TableCell className="py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="py-3">
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell py-3">
				{period !== undefined ? <PeriodBadge period={period} /> : '—'}
			</TableCell>
			<TableCell className="hidden md:table-cell py-3">
				{task.completed_at !== null
					? dayjs(task.completed_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="py-3">
				<ActionButtons onEdit={onEdit} onReturnToQA={onReturnToQA} />
			</TableCell>
		</TableRow>
	);
}
