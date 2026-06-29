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

	// Хронологически: самый старый → самый свежий. Шапка отчёта (числа) — самый
	// свежий период; охват — от старта самого старого до конца самого свежего.
	const sortedAsc = [...selected].sort((a, b) =>
		dayjs(a.start_date).diff(dayjs(b.start_date)),
	);
	const oldest = sortedAsc[0];
	const period = sortedAsc[sortedAsc.length - 1];

	const periodCount = selected.length;
	const rangeStart = dayjs(oldest.start_date).format('DD.MM.YYYY');
	const rangeEnd = dayjs(period.end_date).format('DD.MM.YYYY');
	const scopeLabel = `с ${rangeStart} по ${rangeEnd} · ${periodCount} ${pluralizePeriods(periodCount)}`;

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
		periodCount,
		scopeLabel,
		generatedAt: dayjs().format('DD.MM.YYYY HH:mm'),
		metrics,
		comment: statistics?.comment ?? null,
		chartData,
		isLocked: statistics !== null,
	};
}

/** Склонение слова «период» под число: 1 период, 2 периода, 5 периодов. */
function pluralizePeriods(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return 'период';
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'периода';
	return 'периодов';
}
