'use client';

import dayjs from 'dayjs';
import { StickyNote } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
			<TableCell className="hidden md:table-cell px-4 py-3">
				{task.completed_at !== null
					? dayjs(task.completed_at).format('DD.MM.YYYY')
					: '—'}
			</TableCell>
			<TableCell className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
				{task.version ?? '—'}
			</TableCell>
			<TableCell className="sticky right-0 bg-background z-10 px-4 py-3">
				<div className="flex items-center gap-1">
					<ActionButtons onEdit={onEdit} onReturnToQA={onReturnToQA} />
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
