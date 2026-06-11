'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
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
			await completeTask({ id: taskId, input: { period_id: selectedPeriodId } });

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
			<Button variant="outline" onClick={onCancel} disabled={loading}>
				Отмена
			</Button>
			<Button onClick={handleConfirm} disabled={!selectedPeriodId || loading}>
				Завершить
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open
			onClose={onCancel}
			title="Завершить задачу"
			size="sm"
			footer={footer}
		>
			<div className="space-y-3">
				<p className="text-sm text-muted-foreground">Выберите период для архивации:</p>
				<PeriodSelector
					periods={periods}
					value={selectedPeriodId}
					onChange={setSelectedPeriodId}
				/>
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
