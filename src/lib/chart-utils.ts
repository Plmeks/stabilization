import dayjs from 'dayjs';
import type { Period, PeriodStatistics, Task } from '@/types';
import { calculateDynamicMetrics } from '@/lib/stats-utils';

export type ChartDataPoint = {
	label: string;
	periodLabel: string;
	completed_cumulative: number;
	uncompleted_critical: number;
	uncompleted_non_critical: number;
	wip_total: number;
	total_problems_cumulative: number;
};

export function calculateChartData(
	periods: Period[],
	tasks: Task[],
	periodStatistics: PeriodStatistics[],
): ChartDataPoint[] {
	if (periods.length === 0) {
		return [];
	}

	const sortedPeriods = [...periods].sort((a, b) =>
		dayjs(a.start_date).diff(dayjs(b.start_date)),
	);

	const firstPeriod = sortedPeriods[0];
	const firstPeriodTasks = tasks.filter((t) => t.creation_period_id === firstPeriod.id);
	const initialCritical = firstPeriodTasks.filter((t) => t.priority === 'Критический').length;
	const initialNonCritical = firstPeriodTasks.filter((t) => t.priority !== 'Критический').length;

	const anchorPoint: ChartDataPoint = {
		label: dayjs(firstPeriod.start_date).subtract(1, 'day').format('DD.MM'),
		periodLabel: '',
		completed_cumulative: 0,
		uncompleted_critical: initialCritical,
		uncompleted_non_critical: initialNonCritical,
		wip_total: 0,
		total_problems_cumulative: firstPeriodTasks.length,
	};

	const periodPoints: ChartDataPoint[] = sortedPeriods.map((period) => {
		const fixedStats = periodStatistics.find((s) => s.period_id === period.id);

		if (fixedStats) {
			return {
				label: dayjs(period.end_date).format('DD.MM'),
				periodLabel: `${dayjs(period.start_date).format('DD.MM')}-${dayjs(period.end_date).format('DD.MM')}.${dayjs(period.end_date).format('YY')}`,
				completed_cumulative: fixedStats.completed_cumulative,
				uncompleted_critical: fixedStats.uncompleted_critical,
				uncompleted_non_critical: fixedStats.uncompleted_non_critical,
				wip_total: fixedStats.wip_total,
				total_problems_cumulative: fixedStats.total_problems_cumulative,
			};
		}

		const dynamic = calculateDynamicMetrics(period, periods, tasks);

		return {
			label: dayjs(period.end_date).format('DD.MM'),
			periodLabel: `${dayjs(period.start_date).format('DD.MM')}-${dayjs(period.end_date).format('DD.MM')}.${dayjs(period.end_date).format('YY')}`,
			completed_cumulative: dynamic.completed_cumulative,
			uncompleted_critical: dynamic.uncompleted_critical,
			uncompleted_non_critical: dynamic.uncompleted_non_critical,
			wip_total: dynamic.wip_total,
			total_problems_cumulative: dynamic.total_problems_cumulative,
		};
	});

	return [anchorPoint, ...periodPoints];
}
