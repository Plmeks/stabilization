import * as React from 'react';
import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { TaskTitle } from '@/components/shared/TaskTitle';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PeriodBadge } from '@/components/shared/PeriodBadge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import type { Task, Period } from '@/types';

interface CurrentTasksRowProps {
	task: Task;
	period: Period | undefined;
	onEdit: () => void;
	onDelete: () => void;
}

export function CurrentTasksRow({ task, period, onEdit, onDelete }: CurrentTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="max-w-xs">
				<TaskTitle title={task.title} />
			</TableCell>
			<TableCell className="text-muted-foreground">
				{task.assignee ?? '—'}
			</TableCell>
			<TableCell>
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell>
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{period ? <PeriodBadge period={period} /> : '—'}
			</TableCell>
			<TableCell className="hidden md:table-cell text-muted-foreground">
				{task.taken_into_work_at
					? dayjs(task.taken_into_work_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell>
				<ActionButtons onEdit={onEdit} onDelete={onDelete} />
			</TableCell>
		</TableRow>
	);
}
