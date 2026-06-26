import type { ChartDataPoint } from '@/lib/chart-utils';
import type { Period } from '@/types';

export type ReportFormat = 'pdf' | 'png' | 'csv';

/**
 * Все числовые метрики, попадающие в отчёт. Совпадает с пересечением полей
 * PeriodStatistics и DynamicMetrics, поэтому в отчёт ложатся как зафиксированные,
 * так и динамические данные (см. build-report-data).
 */
export type ReportMetrics = {
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

export type ReportData = {
	period: Period;
	periodLabel: string;
	generatedAt: string;
	metrics: ReportMetrics;
	comment: string | null;
	/** Кумулятивные точки графиков от самого старого периода до выбранного включительно. */
	chartData: ChartDataPoint[];
	isLocked: boolean;
};
