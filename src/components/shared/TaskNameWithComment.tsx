'use client';

import { MessageCircle } from 'lucide-react';
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
					className="absolute -top-1.5 -left-2 z-10 inline-flex items-center cursor-pointer shrink-0 text-yellow-400 hover:text-yellow-300"
					onClick={onOpenComment}
					aria-label="Комментарий"
				>
					<MessageCircle className="h-3.5 w-3.5 fill-current" />
				</button>
			)}
			<span className="inline align-middle">{titleContent}</span>
		</div>
	);
}
