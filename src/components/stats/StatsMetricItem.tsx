import { roleColor, type MetricRole } from '@/lib/metric-role';

interface StatsMetricItemProps {
	label: string;
	value: number | string;
	role?: MetricRole;
}

/** Метрика как в отчёте: подпись + крупное число, раскрашенное по роли. */
export default function StatsMetricItem({ label, value, role = 'neutral' }: StatsMetricItemProps) {
	const numeric = typeof value === 'number' ? value : 0;
	const color = roleColor(numeric, role);

	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-[0.8rem] font-medium leading-snug text-muted-foreground">{label}</span>
			<span className="text-2xl font-semibold tracking-tight tabular-nums" style={{ color }}>
				{value}
			</span>
		</div>
	);
}
