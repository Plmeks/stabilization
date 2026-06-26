'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import { Button } from '@/components/ui/button';
import { periodsAtom } from '@/atoms/periodsAtom';
import { completeTaskAtom, updateTaskAtom } from '@/atoms/tasksAtom';
import type { UpdateTaskInput } from '@/types';

interface CompleteTaskModalProps {
	open: boolean;
	onClose: () => void;
	onCancel: () => void;
	taskId: string;
	pendingTaskUpdate?: UpdateTaskInput;
	defaultPeriodId?: string;
}

interface CompleteTaskModalBodyProps {
	taskId: string;
	pendingTaskUpdate?: UpdateTaskInput;
	onClose: () => void;
	onCancel: () => void;
	defaultPeriodId?: string;
}

function CompleteTaskModalBody({
	taskId,
	pendingTaskUpdate,
	onClose,
	onCancel,
	defaultPeriodId,
}: CompleteTaskModalBodyProps) {
	const periods = useAtomValue(periodsAtom);
	const completeTask = useSetAtom(completeTaskAtom);
	const updateTask = useSetAtom(updateTaskAtom);

	const [selectedPeriodId, setSelectedPeriodId] = React.useState<string | null>(null);
	const [version, setVersion] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const initialized = React.useRef(false);

	React.useEffect(() => {
		if (!initialized.current && periods.length > 0) {
			initialized.current = true;
			const hasDefault = defaultPeriodId !== undefined && periods.some((p) => p.id === defaultPeriodId);
			setSelectedPeriodId(hasDefault ? defaultPeriodId : periods[0].id);
		}
	}, [periods, defaultPeriodId]);

	const handleConfirm = async () => {
		if (!selectedPeriodId) return;

		setLoading(true);
		try {
			await completeTask({ id: taskId, input: { active_period_id: selectedPeriodId, version: version.trim() || null } });

			if (pendingTaskUpdate && Object.keys(pendingTaskUpdate).length > 0) {
				await updateTask({ id: taskId, input: pendingTaskUpdate });
			}

			onClose();
		} finally {
			setLoading(false);
		}
	};

	const footer = (
		<>
			<Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
				Отмена
			</Button>
			<Button type="submit" disabled={!selectedPeriodId || loading}>
				Завершить
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open
			onClose={onCancel}
			title="Завершить задачу"
			onSubmit={handleConfirm}
			size="sm"
			footer={footer}
		>
			<div className="space-y-3">
				<Label>Выберите период для архивации</Label>
				<PeriodSelector
					periods={periods}
					value={selectedPeriodId}
					onChange={setSelectedPeriodId}
				/>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="complete-version">Версия</Label>
					<Input
						id="complete-version"
						value={version}
						onChange={(e) => setVersion(e.target.value)}
						placeholder="например, 25.500.0"
						disabled={loading}
					/>
				</div>
			</div>
		</ModalWrapper>
	);
}

export function CompleteTaskModal({
	open,
	onClose,
	onCancel,
	taskId,
	pendingTaskUpdate,
	defaultPeriodId,
}: CompleteTaskModalProps) {
	if (!open) {
		return null;
	}

	return (
		<CompleteTaskModalBody
			key={taskId}
			taskId={taskId}
			pendingTaskUpdate={pendingTaskUpdate}
			onClose={onClose}
			onCancel={onCancel}
			defaultPeriodId={defaultPeriodId}
		/>
	);
}
