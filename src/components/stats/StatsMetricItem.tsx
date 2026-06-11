interface StatsMetricItemProps {
	label: string;
	value: number | string;
}

export default function StatsMetricItem({ label, value }: StatsMetricItemProps) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-xl font-semibold tabular-nums">{value}</span>
		</div>
	);
}
