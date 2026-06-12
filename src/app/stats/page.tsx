'use client';

import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { calculateDynamicMetrics } from '@/lib/stats-utils';
import StatsPeriodCard from '@/components/stats/StatsPeriodCard';

export default function StatsPage() {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	const sortedPeriods = [...periods].sort((a, b) =>
		dayjs(b.start_date).diff(dayjs(a.start_date)),
	);

	return (
		<div className="p-6 space-y-5">
			{sortedPeriods.map((period) => {
				const statistics = periodStatistics.find((s) => s.period_id === period.id) ?? null;
				const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks);

				return (
					<StatsPeriodCard
						key={period.id}
						period={period}
						statistics={statistics}
						dynamicMetrics={dynamicMetrics}
					/>
				);
			})}
		</div>
	);
}
