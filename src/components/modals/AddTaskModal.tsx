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

export function AddTaskModal({ open, onClose, defaultPeriodId }: AddTaskModalProps) {
	const periods = useAtomValue(periodsAtom);
	const createTask = useSetAtom(createTaskAtom);

	const [title, setTitle] = React.useState('');
	const [periodId, setPeriodId] = React.useState<string | null>(defaultPeriodId ?? null);
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (!open) {
			setTitle('');
			setPeriodId(defaultPeriodId ?? null);
			setError(null);
			setLoading(false);
		}
	}, [open, defaultPeriodId]);

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
			await createTask({ title: title.trim(), period_id: periodId });
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
			open={open}
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
				<div className="flex flex-col gap-1.5">
					<Label>Период</Label>
					<PeriodSelector
						periods={periods}
						value={periodId}
						onChange={setPeriodId}
						defaultToLatest={!defaultPeriodId}
					/>
				</div>
				{error && (
					<p className="text-sm text-destructive">{error}</p>
				)}
			</div>
		</ModalWrapper>
	);
}
