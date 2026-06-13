import * as React from 'react';
import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { TaskNameWithComment } from '@/components/shared/TaskNameWithComment';
import type { Task, Period } from '@/types';

interface CurrentTasksRowProps {
	task: Task;
	period: Period | undefined;
	creationPeriod: Period | undefined;
	onEdit: () => void;
	onComplete: () => void;
	onReturnToQA: () => void;
	onOpenComment: () => void;
}

export function CurrentTasksRow({ task, creationPeriod, onEdit, onComplete, onReturnToQA, onOpenComment }: CurrentTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="whitespace-normal px-4 py-3">
				<TaskNameWithComment task={task} onOpenComment={onOpenComment} />
			</TableCell>
			<TableCell className="px-4 py-3 whitespace-normal">
				{task.assignee ?? '—'}
			</TableCell>
			<TableCell className="px-4 py-3">
				<PriorityBadge priority={task.priority} />
			</TableCell>
			<TableCell className="px-4 py-3t">
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
			<TableCell className="px-4 py-3">
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
