'use client';

import * as React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { periodsAtom } from '@/atoms/periodsAtom';
import { createTaskAtom } from '@/atoms/tasksAtom';

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
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

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
				period_id: periodId,
				...(isCritical ? { priority: 'Авария' } : {}),
				...(link.trim() ? { link: link.trim() } : {}),
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
					<Label htmlFor="task-title">Название</Label>
					<Input
						id="task-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Введите название задачи"
						disabled={loading}
						aria-invalid={error === 'Введите название задачи' ? true : undefined}
					/>
				</div>
				{!defaultPeriodId && (
					<div className="flex flex-col gap-1.5">
						<Label>Период</Label>
						<PeriodSelector
							periods={periods}
							value={periodId}
							onChange={setPeriodId}
							defaultToLatest={true}
						/>
					</div>
				)}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="task-link">Ссылка (необязательно)</Label>
					<Input
						id="task-link"
						value={link}
						onChange={(e) => setLink(e.target.value)}
						placeholder="https://..."
						disabled={loading}
					/>
				</div>
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
						Критическая задача (приоритет «Авария»)
					</Label>
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
