'use client';

import * as React from 'react';
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { calculateYAxisZoomDomain, type ChartDataPoint } from '@/lib/chart-utils';

interface BacklogChartProps {
	data: ChartDataPoint[];
	dataKey: 'uncompleted_critical' | 'uncompleted_non_critical';
	color: string;
	title: string;
	zoomToRange?: boolean;
}

export function BacklogChart({ data, dataKey, color, title, zoomToRange = false }: BacklogChartProps) {
	const values = React.useMemo(
		() => data.map((point) => point[dataKey]),
		[data, dataKey],
	);

	const yDomain = React.useMemo(
		() => calculateYAxisZoomDomain(values),
		[values],
	);

	if (data.length === 0) {
		return null;
	}

	return (
		<div className="min-w-0">
			<p className="text-sm font-semibold text-foreground mb-3">{title}</p>
			<ResponsiveContainer width="100%" height={280}>
				<LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="periodLabel" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
					<YAxis
						domain={zoomToRange ? yDomain : undefined}
						allowDataOverflow={zoomToRange}
						width={36}
						tickMargin={4}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip
						formatter={(value, name) => {
							const key = String(name);
							if (key === 'uncompleted_critical') {
								return [value, 'Критические'];
							}
							if (key === 'uncompleted_non_critical') {
								return [value, 'Некритичные'];
							}
							return [value, key];
						}}
					/>
					<Line
						type="linear"
						dataKey={dataKey}
						stroke={color}
						strokeWidth={2}
						dot={{ r: 4, fill: color }}
						activeDot={{ r: 6 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
