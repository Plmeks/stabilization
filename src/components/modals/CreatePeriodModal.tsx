'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useSetAtom, useStore } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Button } from '@/components/ui/button';
import { createPeriodAtom, periodsAtom } from '@/atoms/periodsAtom';
import { initExpandedPeriodsAtom } from '@/atoms/uiAtom';

interface CreatePeriodModalProps {
	open: boolean;
	onClose: () => void;
}

interface CreatePeriodModalContentProps {
	onClose: () => void;
}

function CreatePeriodModalContent({ onClose }: CreatePeriodModalContentProps) {
	const [startDate, setStartDate] = React.useState<string | null>(null);
	const [endDate, setEndDate] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

	const createPeriod = useSetAtom(createPeriodAtom);
	const initExpandedPeriods = useSetAtom(initExpandedPeriodsAtom);
	const store = useStore();

	const handleSubmit = async () => {
		if (!startDate || !endDate) {
			setError('Выберите обе даты');
			return;
		}

		if (dayjs(endDate).isBefore(dayjs(startDate))) {
			setError('Дата конца не может быть раньше даты начала');
			return;
		}

		setError(null);
		setLoading(true);

		try {
			await createPeriod({ start_date: startDate, end_date: endDate });
			const updatedPeriods = store.get(periodsAtom);
			initExpandedPeriods(updatedPeriods);
			onClose();
		} catch {
			setError('Не удалось создать период. Попробуйте снова.');
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
				Создать
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={true}
			onClose={onClose}
			title="Добавить период"
			size="sm"
			footer={footer}
		>
			<DateRangePicker
				startDate={startDate}
				endDate={endDate}
				onStartDateChange={setStartDate}
				onEndDateChange={setEndDate}
				error={error ?? undefined}
			/>
		</ModalWrapper>
	);
}

export function CreatePeriodModal({ open, onClose }: CreatePeriodModalProps) {
	if (!open) return null;
	return <CreatePeriodModalContent onClose={onClose} />;
}
