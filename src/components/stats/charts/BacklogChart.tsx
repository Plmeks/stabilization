'use client';

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import type { ChartDataPoint } from '@/lib/chart-utils';

interface BacklogChartProps {
	data: ChartDataPoint[];
	dataKey: 'uncompleted_critical' | 'uncompleted_non_critical';
	color: string;
	title: string;
}

export function BacklogChart({ data, dataKey, color, title }: BacklogChartProps) {
	if (data.length === 0) {
		return null;
	}

	return (
		<div>
			<p className="text-sm font-semibold text-foreground mb-3">{title}</p>
			<ResponsiveContainer width="100%" height={280}>
				<LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="periodLabel" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
					<YAxis
						label={{
							value: 'Остаток',
							angle: -90,
							position: 'insideLeft',
							style: { fontSize: 11 },
						}}
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
						type="monotone"
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
