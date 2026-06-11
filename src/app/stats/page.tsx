'use client';

import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
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
				const periodTasks = tasks.filter((t) => t.period_id === period.id);
				const statistics = periodStatistics.find((s) => s.period_id === period.id) ?? null;

				const dynamicAddedToBacklog = periodTasks.filter((t) => t.status !== null).length;
				const dynamicAddedCritical = periodTasks.filter((t) => t.status !== null && t.priority === 'Авария').length;
				const dynamicResolvedTotal = periodTasks.filter((t) => t.status === 'Завершена').length;
				const dynamicResolvedCritical = periodTasks.filter((t) => t.status === 'Завершена' && t.priority === 'Авария').length;
				const dynamicInProgress = periodTasks.filter((t) => t.status === 'В работе').length;
				const dynamicInTesting = periodTasks.filter((t) => t.status === 'В тесте').length;

				return (
					<StatsPeriodCard
						key={period.id}
						period={period}
						statistics={statistics}
						dynamicAddedToBacklog={dynamicAddedToBacklog}
						dynamicAddedCritical={dynamicAddedCritical}
						dynamicResolvedTotal={dynamicResolvedTotal}
						dynamicResolvedCritical={dynamicResolvedCritical}
						dynamicInProgress={dynamicInProgress}
						dynamicInTesting={dynamicInTesting}
					/>
				);
			})}
		</div>
	);
}
