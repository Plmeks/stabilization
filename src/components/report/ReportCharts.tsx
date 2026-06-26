'use client';

import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from 'recharts';

import type { ChartDataPoint } from '@/lib/chart-utils';

const REPORT_COLORS = {
	done: '#16a34a',
	doneFill: '#22c55e',
	critical: '#dc2626',
	criticalFill: '#f87171',
	nonCritical: '#ea580c',
	nonCriticalFill: '#fb923c',
	wip: '#3b82f6',
	grid: '#e8eaee',
} as const;

const CFD_WIDTH = 764;
const CFD_HEIGHT = 300;
const BACKLOG_WIDTH = 374;
const BACKLOG_HEIGHT = 262;

/**
 * Графики для PDF/PNG-отчёта: фиксированные размеры (без ResponsiveContainer) и
 * отключённая анимация, чтобы SVG отрисовался синхронно до снимка.
 */
export function ReportCharts({ data }: { data: ChartDataPoint[] }) {
	if (data.length === 0) {
		return null;
	}

	return (
		<div className="report-charts">
			<figure className="report-chart">
				<figcaption className="report-chart__title">CFD с линией WIP</figcaption>
				<ComposedChart
					width={CFD_WIDTH}
					height={CFD_HEIGHT}
					data={data}
					margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke={REPORT_COLORS.grid} />
					<XAxis dataKey="label" tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} />
					<Legend />
					<Area
						type="linear"
						dataKey="completed_cumulative"
						name="Готовые"
						stackId="cfd"
						fill={REPORT_COLORS.doneFill}
						stroke={REPORT_COLORS.done}
						legendType="square"
						fillOpacity={0.7}
						isAnimationActive={false}
					/>
					<Area
						type="linear"
						dataKey="uncompleted_critical"
						name="Критичные"
						stackId="cfd"
						fill={REPORT_COLORS.criticalFill}
						stroke={REPORT_COLORS.critical}
						legendType="square"
						fillOpacity={0.7}
						isAnimationActive={false}
					/>
					<Area
						type="linear"
						dataKey="uncompleted_non_critical"
						name="Некритичные"
						stackId="cfd"
						fill={REPORT_COLORS.nonCriticalFill}
						stroke={REPORT_COLORS.nonCriticalFill}
						legendType="square"
						fillOpacity={0.7}
						isAnimationActive={false}
					/>
					<Line
						type="linear"
						dataKey="wip_total"
						name="WIP"
						stroke={REPORT_COLORS.wip}
						strokeDasharray="5 5"
						dot={false}
						strokeWidth={2}
						isAnimationActive={false}
					/>
				</ComposedChart>
			</figure>

			<div className="report-charts__row">
				<ReportBacklogChart
					data={data}
					dataKey="uncompleted_critical"
					color={REPORT_COLORS.critical}
					title="Кумулятивный остаток критичных тикетов"
				/>
				<ReportBacklogChart
					data={data}
					dataKey="uncompleted_non_critical"
					color={REPORT_COLORS.nonCritical}
					title="Кумулятивный остаток некритичных тикетов"
				/>
			</div>
		</div>
	);
}

function ReportBacklogChart({
	data,
	dataKey,
	color,
	title,
}: {
	data: ChartDataPoint[];
	dataKey: 'uncompleted_critical' | 'uncompleted_non_critical';
	color: string;
	title: string;
}) {
	// Базовая линия от нуля — как на странице Графики при выключенном
	// «Масштабировать по диапазону» (состояние по умолчанию).
	return (
		<figure className="report-chart">
			<figcaption className="report-chart__title">{title}</figcaption>
			<LineChart
				width={BACKLOG_WIDTH}
				height={BACKLOG_HEIGHT}
				data={data}
				margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
			>
				<CartesianGrid strokeDasharray="3 3" stroke={REPORT_COLORS.grid} />
				<XAxis dataKey="periodLabel" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
				<YAxis tick={{ fontSize: 11 }} />
				<Line
					type="linear"
					dataKey={dataKey}
					stroke={color}
					strokeWidth={2}
					dot={{ r: 3, fill: color }}
					isAnimationActive={false}
				/>
			</LineChart>
		</figure>
	);
}
