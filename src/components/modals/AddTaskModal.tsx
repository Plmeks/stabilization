'use client';

import * as React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { periodsAtom } from '@/atoms/periodsAtom';
import { createTaskAtom } from '@/atoms/tasksAtom';
import { extractJabberLink } from '@/lib/utils';

interface AddTaskModalProps {
	open: boolean;
	onClose: () => void;
	defaultPeriodId?: string;
}

interface AddTaskModalContentProps {
	onClose: () => void;
	defaultPeriodId?: string;
}

function AddTaskModalContent({ onClose, defaultPeriodId }: AddTaskModalContentProps) {
	const periods = useAtomValue(periodsAtom);
	const createTask = useSetAtom(createTaskAtom);

	const [title, setTitle] = React.useState('');
	const [periodId, setPeriodId] = React.useState<string | null>(defaultPeriodId ?? null);
	const [isCritical, setIsCritical] = React.useState(false);
	const [link, setLink] = React.useState('');
	const [linkEdited, setLinkEdited] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [comment, setComment] = React.useState('');
	const [loading, setLoading] = React.useState(false);

	const handleTitleChange = (value: string) => {
		setTitle(value);
		// Auto-fill the jabber link from a numeric id in the title, unless the
		// user has already typed their own link.
		if (!linkEdited) {
			setLink(extractJabberLink(value) ?? '');
		}
	};

	const handleLinkChange = (value: string) => {
		setLink(value);
		setLinkEdited(true);
	};

	const handleSubmit = async () => {
		if (!title.trim()) {
			setError('Введите название задачи');
			return;
		}

		if (!periodId) {
			setError('Выберите период');
			return;
		}

		setError(null);
		setLoading(true);

		try {
			await createTask({
				title: title.trim(),
				creation_period_id: periodId,
				...(isCritical ? { priority: 'Критический' } : {}),
				...(link.trim() ? { link: link.trim() } : {}),
				...(comment.trim() ? { comment: comment.trim() } : {}),
			});
			onClose();
		} catch {
			setError('Не удалось создать задачу');
		} finally {
			setLoading(false);
		}
	};

	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={loading}>
				Отмена
			</Button>
			<Button onClick={handleSubmit} disabled={loading}>
				Добавить
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={true}
			onClose={onClose}
			title="Добавить задачу"
			footer={footer}
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="task-title" required>Название</Label>
					<Input
						id="task-title"
						value={title}
						onChange={(e) => handleTitleChange(e.target.value)}
						placeholder="Введите название задачи"
						disabled={loading}
						aria-invalid={error === 'Введите название задачи' ? true : undefined}
					/>
				</div>
				{!defaultPeriodId && (
					<div className="flex flex-col gap-1.5">
						<Label required>Период</Label>
						<PeriodSelector
							periods={periods}
							value={periodId}
							onChange={setPeriodId}
							defaultToLatest={true}
						/>
					</div>
				)}
				<div className="flex items-center gap-2">
					<input
						id="task-critical"
						type="checkbox"
						checked={isCritical}
						onChange={(e) => setIsCritical(e.target.checked)}
						disabled={loading}
						className="h-4 w-4 cursor-pointer"
					/>
					<Label htmlFor="task-critical" className="cursor-pointer">
						Критическая задача
					</Label>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="task-link">Ссылка</Label>
					<Input
						id="task-link"
						value={link}
						onChange={(e) => handleLinkChange(e.target.value)}
						placeholder="Ссылка на задачу"
						disabled={loading}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="task-comment">Комментарий</Label>
					<Textarea
						id="task-comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Введите комментарий"
						disabled={loading}
						rows={3}
						className="resize-none"
					/>
				</div>
				{error && (
					<p className="text-sm text-destructive">{error}</p>
				)}
			</div>
		</ModalWrapper>
	);
}

export function AddTaskModal({ open, onClose, defaultPeriodId }: AddTaskModalProps) {
	if (!open) return null;
	return <AddTaskModalContent onClose={onClose} defaultPeriodId={defaultPeriodId} />;
}
