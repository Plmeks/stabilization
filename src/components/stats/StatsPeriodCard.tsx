'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';
import { formatPeriodLabel } from '@/lib/utils';
import type { Period, PeriodStatistics } from '@/types';
import { Button } from '@/components/ui/button';
import StatsMetricItem from './StatsMetricItem';
import LockMetricsButton from './LockMetricsButton';
import { EditMetricsModal } from '@/components/modals/EditMetricsModal';

interface StatsPeriodCardProps {
	period: Period;
	statistics: PeriodStatistics | null;
	dynamicAddedToBacklog: number;
	dynamicAddedCritical: number;
	dynamicResolvedTotal: number;
	dynamicResolvedCritical: number;
	dynamicInProgress: number;
	dynamicInTesting: number;
}

export default function StatsPeriodCard({
	period,
	statistics,
	dynamicAddedToBacklog,
	dynamicAddedCritical,
	dynamicResolvedTotal,
	dynamicResolvedCritical,
	dynamicInProgress,
	dynamicInTesting,
}: StatsPeriodCardProps) {
	const [editOpen, setEditOpen] = React.useState(false);
	const isLocked = statistics !== null;

	return (
		<div className="border rounded-xl shadow-sm overflow-hidden">
			<div className="flex items-center justify-between px-5 py-4 bg-muted/40">
				<span className="font-medium text-sm">{formatPeriodLabel(period)}</span>
				{isLocked && (
					<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
						<Pencil className="h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="px-5 py-5 space-y-4">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
					<StatsMetricItem
						label="Добавлено в беклог"
						value={isLocked ? statistics.added_to_backlog : dynamicAddedToBacklog}
					/>
					<StatsMetricItem
						label="Из них критических"
						value={isLocked ? statistics.added_critical : dynamicAddedCritical}
					/>
					<StatsMetricItem
						label="Решено всего"
						value={isLocked ? statistics.resolved_total : dynamicResolvedTotal}
					/>
					<StatsMetricItem
						label="Решено критических"
						value={isLocked ? statistics.resolved_critical : dynamicResolvedCritical}
					/>
					<StatsMetricItem
						label="В работе"
						value={isLocked ? statistics.in_progress : dynamicInProgress}
					/>
					<StatsMetricItem
						label="В тесте"
						value={isLocked ? statistics.in_testing : dynamicInTesting}
					/>
				</div>

				{isLocked ? (
					<p className="text-xs text-muted-foreground">
						Зафиксировано: {dayjs(statistics.locked_at).format('DD.MM.YYYY HH:mm')}
					</p>
				) : (
					<div className="flex justify-end">
						<LockMetricsButton periodId={period.id} />
					</div>
				)}
			</div>

			{statistics !== null && editOpen && (
				<EditMetricsModal
					key={statistics.id}
					open={editOpen}
					onClose={() => setEditOpen(false)}
					statistics={statistics}
				/>
			)}
		</div>
	);
}
