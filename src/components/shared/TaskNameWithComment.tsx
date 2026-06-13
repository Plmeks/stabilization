'use client';

import { MessageSquareText } from 'lucide-react';
import { TaskTitle } from '@/components/shared/TaskTitle';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskNameWithCommentProps {
	task: Task;
	onOpenComment: () => void;
	className?: string;
	titleClassName?: string;
	linkClassName?: string;
}

export function TaskNameWithComment({
	task,
	onOpenComment,
	className,
	titleClassName,
	linkClassName,
}: TaskNameWithCommentProps) {
	const hasComment = Boolean(task.comment?.trim());

	const titleContent = task.link ? (
		<a
			href={task.link}
			target="_blank"
			rel="noopener noreferrer"
			className={cn('text-blue-600 hover:underline', linkClassName)}
		>
			{task.title}
		</a>
	) : (
		<TaskTitle title={task.title} className={titleClassName} />
	);

	return (
		<div className={cn('relative break-words', className)}>
			{hasComment && (
				<button
					type="button"
					className="absolute -top-1.5 -left-2 z-10 inline-flex items-center cursor-pointer shrink-0 text-blue-400 hover:text-blue-300"
					onClick={onOpenComment}
					aria-label="Комментарий"
				>
					<MessageSquareText className="h-3 w-3" />
				</button>
			)}
			<span className="inline align-middle">{titleContent}</span>
		</div>
	);
}
