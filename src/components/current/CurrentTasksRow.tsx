import * as React from 'react';
import dayjs from 'dayjs';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { AssigneeTags } from '@/components/shared/AssigneeTags';
import { TaskNameWithComment } from '@/components/shared/TaskNameWithComment';
import type { Task, Period } from '@/types';

interface CurrentTasksRowProps {
	task: Task;
	period: Period | undefined;
	creationPeriod: Period | undefined;
	onEdit: () => void;
	onComplete: () => void;
	onOpenComment: () => void;
}

export function CurrentTasksRow({ task, creationPeriod, onEdit, onComplete, onOpenComment }: CurrentTasksRowProps) {
	return (
		<TableRow>
			<TableCell className="whitespace-normal px-2 py-2 md:px-4 md:py-3">
				<TaskNameWithComment task={task} onOpenComment={onOpenComment} />
			</TableCell>
			<TableCell className="px-2 py-2 md:px-4 md:py-3 whitespace-normal">
				<AssigneeTags value={task.assignee} />
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
			<TableCell className="sticky right-0 bg-background z-10 px-2 py-2 md:px-4 md:py-3">
				<ActionButtons onComplete={onComplete} onEdit={onEdit} />
			</TableCell>
		</TableRow>
	);
}
