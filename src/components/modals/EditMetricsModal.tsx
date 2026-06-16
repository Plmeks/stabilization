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
	added_non_critical: number;
	resolved_total: number;
	resolved_critical: number;
	resolved_non_critical: number;
	in_progress: number;
	in_testing: number;
	in_block: number;
	wip_total: number;
	total_problems_cumulative: number;
	completed_cumulative: number;
	uncompleted: number;
	uncompleted_critical: number;
	uncompleted_non_critical: number;
};

export function EditMetricsModal({ open, onClose, statistics }: EditMetricsModalProps) {
	const updateStatistics = useSetAtom(updatePeriodStatisticsAtom);

	const [metrics, setMetrics] = React.useState<MetricsState>({
		added_to_backlog: statistics.added_to_backlog,
		added_critical: statistics.added_critical,
		added_non_critical: statistics.added_non_critical,
		resolved_total: statistics.resolved_total,
		resolved_critical: statistics.resolved_critical,
		resolved_non_critical: statistics.resolved_non_critical,
		in_progress: statistics.in_progress,
		in_testing: statistics.in_testing,
		in_block: statistics.in_block,
		wip_total: statistics.wip_total,
		total_problems_cumulative: statistics.total_problems_cumulative,
		completed_cumulative: statistics.completed_cumulative,
		uncompleted: statistics.uncompleted,
		uncompleted_critical: statistics.uncompleted_critical,
		uncompleted_non_critical: statistics.uncompleted_non_critical,
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
		<ModalWrapper open={open} onClose={onClose} title="Редактировать метрики периода" footer={footer}>
			<div className="overflow-y-auto max-h-[60vh]">
				<div className="space-y-5">
					<div>
						<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
							Были добавлены за период
						</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-added-to-backlog">Добавлено всего</Label>
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
								<Label htmlFor="edit-added-critical">Критических</Label>
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
								<Label htmlFor="edit-added-non-critical">Некритических</Label>
								<Input
									id="edit-added-non-critical"
									type="number"
									min="0"
									value={metrics.added_non_critical}
									onChange={handleChange('added_non_critical')}
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					<div>
						<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
							Завершено в период
						</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-resolved-total">Выполнено всего</Label>
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
								<Label htmlFor="edit-resolved-critical">Критических</Label>
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
								<Label htmlFor="edit-resolved-non-critical">Некритических</Label>
								<Input
									id="edit-resolved-non-critical"
									type="number"
									min="0"
									value={metrics.resolved_non_critical}
									onChange={handleChange('resolved_non_critical')}
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					<div>
						<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
							WIP за период
						</p>
						<div className="grid grid-cols-2 gap-4">
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
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-wip-total">WIP итого</Label>
								<Input
									id="edit-wip-total"
									type="number"
									min="0"
									value={metrics.wip_total}
									onChange={handleChange('wip_total')}
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-in-block">В блоке</Label>
								<Input
									id="edit-in-block"
									type="number"
									min="0"
									value={metrics.in_block}
									onChange={handleChange('in_block')}
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					<div>
						<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
							Накопительные
						</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-total-problems-cumulative">Всего проблем</Label>
								<Input
									id="edit-total-problems-cumulative"
									type="number"
									min="0"
									value={metrics.total_problems_cumulative}
									onChange={handleChange('total_problems_cumulative')}
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-completed-cumulative">Выполнено всего</Label>
								<Input
									id="edit-completed-cumulative"
									type="number"
									min="0"
									value={metrics.completed_cumulative}
									onChange={handleChange('completed_cumulative')}
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-uncompleted">Незавершённые</Label>
								<Input
									id="edit-uncompleted"
									type="number"
									min="0"
									value={metrics.uncompleted}
									onChange={handleChange('uncompleted')}
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-uncompleted-critical">Незав. критических</Label>
								<Input
									id="edit-uncompleted-critical"
									type="number"
									min="0"
									value={metrics.uncompleted_critical}
									onChange={handleChange('uncompleted_critical')}
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="edit-uncompleted-non-critical">Незав. некритических</Label>
								<Input
									id="edit-uncompleted-non-critical"
									type="number"
									min="0"
									value={metrics.uncompleted_non_critical}
									onChange={handleChange('uncompleted_non_critical')}
									disabled={loading}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{error !== null && (
				<p className="text-sm text-destructive mt-2">{error}</p>
			)}
		</ModalWrapper>
	);
}
