import dayjs from 'dayjs';
import { Lock } from 'lucide-react';
import { formatPeriodLabel } from '@/lib/utils';
import type { Period } from '@/types';
import StatsMetricItem from './StatsMetricItem';
import LockMetricsButton from './LockMetricsButton';

interface StatsPeriodCardProps {
	period: Period;
	addedToBacklog: number;
	addedCritical: number;
	resolvedTotal: number;
	resolvedCritical: number;
}

export default function StatsPeriodCard({
	period,
	addedToBacklog,
	addedCritical,
	resolvedTotal,
	resolvedCritical,
}: StatsPeriodCardProps) {
	const isLocked = period.metrics_snapshot !== null;

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="flex items-center justify-between px-4 py-3 bg-muted/40">
				<span className="font-medium text-sm">{formatPeriodLabel(period)}</span>
				{isLocked && (
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Lock className="h-3 w-3" />
						<span>
							Зафиксировано {dayjs(period.metrics_locked_at).format('DD.MM.YYYY HH:mm')}
						</span>
					</div>
				)}
			</div>

			<div className="px-4 py-4 space-y-4">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<StatsMetricItem label="Добавлено в беклог" value={addedToBacklog} />
					<StatsMetricItem label="Из них критических" value={addedCritical} />
					<StatsMetricItem label="Решено всего" value={resolvedTotal} />
					<StatsMetricItem label="Решено критических" value={resolvedCritical} />
				</div>

				{isLocked && (
					<div className="border-t pt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
						<StatsMetricItem
							label="В работе"
							value={period.metrics_snapshot!.in_progress}
						/>
						<StatsMetricItem
							label="В тесте"
							value={period.metrics_snapshot!.in_testing}
						/>
					</div>
				)}

				{!isLocked && (
					<div className="flex justify-end">
						<LockMetricsButton periodId={period.id} />
					</div>
				)}
			</div>
		</div>
	);
}
