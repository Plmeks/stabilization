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
	onReturnToQA: () => void;
}

export function CurrentTasksRow({ task, period, onEdit, onDelete, onReturnToQA }: CurrentTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="max-w-md break-words py-3">
				<TaskTitle title={task.title} />
			</TableCell>
			<TableCell className="text-muted-foreground py-3">
				{task.assignee ?? '—'}
			</TableCell>
			<TableCell className="py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="py-3">
				<StatusBadge status={task.status} />
			</TableCell>
			<TableCell className="hidden md:table-cell py-3">
				{period ? <PeriodBadge period={period} /> : '—'}
			</TableCell>
			<TableCell className="hidden md:table-cell text-muted-foreground py-3">
				{task.taken_into_work_at
					? dayjs(task.taken_into_work_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="py-3">
				<ActionButtons onEdit={onEdit} onDelete={onDelete} onReturnToQA={onReturnToQA} />
			</TableCell>
		</TableRow>
	);
}
