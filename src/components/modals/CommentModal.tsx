'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateTaskAtom } from '@/atoms/tasksAtom';
import type { Task } from '@/types';

interface CommentModalProps {
	open: boolean;
	onClose: () => void;
	task: Task;
}

interface CommentModalContentProps {
	onClose: () => void;
	task: Task;
}

function CommentModalContent({ onClose, task }: CommentModalContentProps) {
	const updateTask = useSetAtom(updateTaskAtom);
	const [localComment, setLocalComment] = React.useState(task.comment ?? '');
	const [loading, setLoading] = React.useState(false);

	const handleSave = async () => {
		setLoading(true);
		try {
			await updateTask({ id: task.id, input: { comment: localComment.trim() || null } });
			onClose();
		} finally {
			setLoading(false);
		}
	};

	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={loading}>
				Отмена
			</Button>
			<Button onClick={handleSave} disabled={loading}>
				Сохранить
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={true}
			onClose={onClose}
			title="Комментарий"
			size="sm"
			footer={footer}
		>
			<Textarea
				value={localComment}
				onChange={(e) => setLocalComment(e.target.value)}
				placeholder="Введите комментарий"
				rows={5}
				className="resize-none"
				autoFocus
				disabled={loading}
			/>
		</ModalWrapper>
	);
}

export function CommentModal({ open, onClose, task }: CommentModalProps) {
	if (!open) return null;
	return <CommentModalContent key={task.id} onClose={onClose} task={task} />;
}
