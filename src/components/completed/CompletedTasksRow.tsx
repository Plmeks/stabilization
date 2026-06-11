'use client';

import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PeriodBadge } from '@/components/shared/PeriodBadge';
import { TaskTitle } from '@/components/shared/TaskTitle';
import type { Task, Period } from '@/types';

interface CompletedTasksRowProps {
	task: Task;
	period: Period | undefined;
	onEdit: () => void;
	onDelete: () => void;
}

export function CompletedTasksRow({ task, period, onEdit, onDelete }: CompletedTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="max-w-xs">
				<TaskTitle title={task.title} />
			</TableCell>
			<TableCell>{task.assignee ?? '—'}</TableCell>
			<TableCell>
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell>
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{period !== undefined ? <PeriodBadge period={period} /> : '—'}
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{task.completed_at !== null
					? dayjs(task.completed_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell>
				<ActionButtons onEdit={onEdit} onDelete={onDelete} />
			</TableCell>
		</TableRow>
	);
}
