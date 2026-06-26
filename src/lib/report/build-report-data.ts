import dayjs from 'dayjs';
import { calculateChartData } from '@/lib/chart-utils';
import { calculateDynamicMetrics } from '@/lib/stats-utils';
import { formatPeriodLabel } from '@/lib/utils';
import type { Period, PeriodStatistics, Task } from '@/types';
import type { ReportData, ReportMetrics } from './types';

/**
 * Собирает данные отчёта за выбранный период.
 *
 * Числа берутся за выбранный период: зафиксированная статистика, если есть,
 * иначе динамический расчёт — ровно как в StatsPeriodCard (metrics = statistics ?? dynamicMetrics).
 * Данные графиков кумулятивны от самого старого периода до выбранного включительно —
 * как в ChartsSection (срез по индексу выбранного периода в хронологическом порядке).
 */
export function buildReportData(
	selectedPeriodId: string,
	periods: Period[],
	tasks: Task[],
	periodStatistics: PeriodStatistics[],
): ReportData | null {
	const period = periods.find((p) => p.id === selectedPeriodId);
	if (!period) {
		return null;
	}

	const statistics = periodStatistics.find((s) => s.period_id === period.id) ?? null;
	const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks, periodStatistics);
	const source = statistics ?? dynamicMetrics;

	const metrics: ReportMetrics = {
		added_to_backlog: source.added_to_backlog,
		added_critical: source.added_critical,
		added_non_critical: source.added_non_critical,
		resolved_total: source.resolved_total,
		resolved_critical: source.resolved_critical,
		resolved_non_critical: source.resolved_non_critical,
		in_progress: source.in_progress,
		in_testing: source.in_testing,
		in_block: source.in_block,
		wip_total: source.wip_total,
		total_problems_cumulative: source.total_problems_cumulative,
		completed_cumulative: source.completed_cumulative,
		uncompleted: source.uncompleted,
		uncompleted_critical: source.uncompleted_critical,
		uncompleted_non_critical: source.uncompleted_non_critical,
	};

	const sortedPeriods = [...periods].sort((a, b) =>
		dayjs(a.start_date).diff(dayjs(b.start_date)),
	);
	const selectedIndex = sortedPeriods.findIndex((p) => p.id === period.id);
	const allChartData = calculateChartData(periods, tasks, periodStatistics);
	const chartData = allChartData.slice(0, (selectedIndex === -1 ? 0 : selectedIndex) + 1);

	return {
		period,
		periodLabel: formatPeriodLabel(period),
		generatedAt: dayjs().format('DD.MM.YYYY HH:mm'),
		metrics,
		comment: statistics?.comment ?? null,
		chartData,
		isLocked: statistics !== null,
	};
}
