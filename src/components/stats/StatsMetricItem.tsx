interface StatsMetricItemProps {
	label: string;
	value: number | string;
}

export default function StatsMetricItem({ label, value }: StatsMetricItemProps) {
	return (
		<div className="bg-muted/30 rounded-lg p-3 flex flex-col gap-1">
			<span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
			<span className="text-2xl font-semibold tabular-nums">{value}</span>
		</div>
	);
}
