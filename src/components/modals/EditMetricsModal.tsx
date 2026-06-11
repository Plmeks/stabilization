'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePeriodStatisticsAtom } from '@/atoms/statsAtom';
import type { PeriodStatistics } from '@/types';

interface EditMetricsModalProps {
	open: boolean;
	onClose: () => void;
	statistics: PeriodStatistics;
}

type MetricsState = {
	added_to_backlog: number;
	added_critical: number;
	resolved_total: number;
	resolved_critical: number;
	in_progress: number;
	in_testing: number;
};

export function EditMetricsModal({ open, onClose, statistics }: EditMetricsModalProps) {
	const updateStatistics = useSetAtom(updatePeriodStatisticsAtom);

	const [metrics, setMetrics] = React.useState<MetricsState>({
		added_to_backlog: statistics.added_to_backlog,
		added_critical: statistics.added_critical,
		resolved_total: statistics.resolved_total,
		resolved_critical: statistics.resolved_critical,
		in_progress: statistics.in_progress,
		in_testing: statistics.in_testing,
	});
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const handleChange = (field: keyof MetricsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setMetrics((prev) => ({ ...prev, [field]: parseInt(e.target.value, 10) || 0 }));
	};

	const handleSave = async () => {
		setLoading(true);
		setError(null);
		try {
			await updateStatistics({ id: statistics.id, metrics });
			onClose();
		} catch {
			setError('Не удалось сохранить');
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
		<ModalWrapper open={open} onClose={onClose} title="Редактировать метрики" footer={footer}>
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-added-to-backlog">Добавлено в беклог</Label>
					<Input
						id="edit-added-to-backlog"
						type="number"
						min="0"
						value={metrics.added_to_backlog}
						onChange={handleChange('added_to_backlog')}
						disabled={loading}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-added-critical">Из них критических</Label>
					<Input
						id="edit-added-critical"
						type="number"
						min="0"
						value={metrics.added_critical}
						onChange={handleChange('added_critical')}
						disabled={loading}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-resolved-total">Решено всего</Label>
					<Input
						id="edit-resolved-total"
						type="number"
						min="0"
						value={metrics.resolved_total}
						onChange={handleChange('resolved_total')}
						disabled={loading}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-resolved-critical">Решено критических</Label>
					<Input
						id="edit-resolved-critical"
						type="number"
						min="0"
						value={metrics.resolved_critical}
						onChange={handleChange('resolved_critical')}
						disabled={loading}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-in-progress">В работе</Label>
					<Input
						id="edit-in-progress"
						type="number"
						min="0"
						value={metrics.in_progress}
						onChange={handleChange('in_progress')}
						disabled={loading}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="edit-in-testing">В тесте</Label>
					<Input
						id="edit-in-testing"
						type="number"
						min="0"
						value={metrics.in_testing}
						onChange={handleChange('in_testing')}
						disabled={loading}
					/>
				</div>
			</div>

			{error !== null && (
				<p className="text-sm text-destructive mt-2">{error}</p>
			)}
		</ModalWrapper>
	);
}
