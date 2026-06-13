import * as React from 'react';
import dayjs from 'dayjs';
import { StickyNote } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
	onOpenComment: () => void;
}

export function CurrentTasksRow({ task, creationPeriod, onEdit, onComplete, onReturnToQA, onOpenComment }: CurrentTasksRowProps) {
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
				<div className="flex items-center gap-1">
					<ActionButtons onComplete={onComplete} onEdit={onEdit} onReturnToQA={onReturnToQA} />
					<Button
						variant="ghost"
						size="icon"
						className={
							task.comment?.trim()
								? 'h-8 w-8 text-yellow-500 hover:text-yellow-600'
								: 'h-8 w-8'
						}
						onClick={onOpenComment}
						aria-label="Комментарий"
					>
						<StickyNote className="h-4 w-4" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
