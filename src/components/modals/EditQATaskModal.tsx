'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTaskAtom } from '@/atoms/tasksAtom';
import type { Task, Priority } from '@/types';

interface EditQATaskModalProps {
	open: boolean;
	onClose: () => void;
	task: Task;
}

interface EditQATaskModalContentProps {
	onClose: () => void;
	task: Task;
}

function EditQATaskModalContent({ onClose, task }: EditQATaskModalContentProps) {
	const updateTask = useSetAtom(updateTaskAtom);

	const [title, setTitle] = React.useState(task.title);
	const [link, setLink] = React.useState(task.link ?? '');
	const [isCritical, setIsCritical] = React.useState(task.priority === 'Критический');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const prevNonCriticalPriority = React.useRef<Priority | null>(
		task.priority !== 'Критический' ? (task.priority ?? null) : null,
	);

	const handleSave = async () => {
		if (!title.trim()) {
			setError('Введите название задачи');
			return;
		}

		setError(null);
		setLoading(true);

		const priority: Priority | null = isCritical
			? 'Критический'
			: (prevNonCriticalPriority.current ?? 'Нормальный');

		try {
			await updateTask({
				id: task.id,
				input: {
					title: title.trim(),
					link: link.trim() || null,
					priority,
				},
			});
			onClose();
		} catch {
			setError('Не удалось сохранить задачу');
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
			title="Редактировать задачу"
			footer={footer}
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="qa-edit-title">Название</Label>
					<Input
						id="qa-edit-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Название задачи"
						disabled={loading}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="qa-edit-link">Ссылка (необязательно)</Label>
					<Input
						id="qa-edit-link"
						value={link}
						onChange={(e) => setLink(e.target.value)}
						placeholder="https://..."
						disabled={loading}
					/>
				</div>
				<div className="flex items-center gap-2">
					<input
						id="qa-edit-critical"
						type="checkbox"
						checked={isCritical}
						onChange={(e) => setIsCritical(e.target.checked)}
						disabled={loading}
						className="h-4 w-4 cursor-pointer"
					/>
					<Label htmlFor="qa-edit-critical" className="cursor-pointer">
						Критическая задача
					</Label>
				</div>
				{error !== null && (
					<p className="text-sm text-destructive">{error}</p>
				)}
			</div>
		</ModalWrapper>
	);
}

export function EditQATaskModal({ open, onClose, task }: EditQATaskModalProps) {
	if (!open) return null;
	return <EditQATaskModalContent key={task.id} onClose={onClose} task={task} />;
}
