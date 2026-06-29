import dayjs from 'dayjs';
import { calculateChartData } from '@/lib/chart-utils';
import { calculateDynamicMetrics } from '@/lib/stats-utils';
import { formatPeriodLabel } from '@/lib/utils';
import type { Period, PeriodStatistics, Task } from '@/types';
import type { ReportData, ReportMetrics } from './types';

/**
 * Собирает данные отчёта по выбранным периодам.
 *
 * Период-«шапка» (числа отчёта) — самый свежий из выбранных: зафиксированная
 * статистика, если есть, иначе динамический расчёт — ровно как в StatsPeriodCard
 * (metrics = statistics ?? dynamicMetrics).
 *
 * Данные графиков — только выбранные точки в хронологическом порядке (как в
 * ChartsSection: фильтр по набору выбранных периодов). Кумулятивные значения
 * каждой точки самодостаточны, поэтому фильтр-вид не искажает числа.
 */
export function buildReportData(
	selectedPeriodIds: string[],
	periods: Period[],
	tasks: Task[],
	periodStatistics: PeriodStatistics[],
): ReportData | null {
	const selectedSet = new Set(selectedPeriodIds);
	const selected = periods.filter((p) => selectedSet.has(p.id));
	if (selected.length === 0) {
		return null;
	}

	// Шапка отчёта — самый свежий из выбранных периодов.
	const period = [...selected].sort((a, b) =>
		dayjs(b.start_date).diff(dayjs(a.start_date)),
	)[0];

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

	const allChartData = calculateChartData(periods, tasks, periodStatistics);
	const chartData = allChartData.filter((pt) => selectedSet.has(pt.periodId));

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
