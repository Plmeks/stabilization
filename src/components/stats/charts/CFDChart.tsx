'use client';

import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import type { ChartDataPoint } from '@/lib/chart-utils';

interface CFDChartProps {
	data: ChartDataPoint[];
}

export function CFDChart({ data }: CFDChartProps) {
	if (data.length === 0) {
		return null;
	}

	return (
		<div>
			<p className="text-sm font-semibold text-foreground mb-3">CFD с линией WIP</p>
			<ResponsiveContainer width="100%" height={350}>
				<ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="label" tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} />
					<Tooltip />
					<Legend />
					<Area
						type="monotone"
						dataKey="completed_cumulative"
						name="Готовые"
						stackId="cfd"
						fill="#22c55e"
						stroke="#16a34a"
						color="#22c55e"
						legendType="square"
						fillOpacity={0.7}
					/>
					<Area
						type="monotone"
						dataKey="uncompleted_critical"
						name="Критичные"
						stackId="cfd"
						fill="#f87171"
						stroke="#dc2626"
						color="#f87171"
						legendType="square"
						fillOpacity={0.7}
					/>
					<Area
						type="monotone"
						dataKey="uncompleted_non_critical"
						name="Некритичные"
						stackId="cfd"
						fill="#fb923c"
						stroke="#fb923c"
						color="#fb923c"
						legendType="square"
						fillOpacity={0.7}
					/>
					<Line
						type="monotone"
						dataKey="wip_total"
						name="WIP"
						stroke="#3b82f6"
						strokeDasharray="5 5"
						dot={false}
						strokeWidth={2}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}
