interface StatsMetricItemProps {
	label: string;
	value: number | string;
	isSubMetric?: boolean;
}

export default function StatsMetricItem({ label, value, isSubMetric = false }: StatsMetricItemProps) {
	return (
		<div
			className={[
				'rounded-lg p-3 flex flex-col gap-1',
				isSubMetric ? 'bg-muted/20 pl-3 ml-3' : 'bg-muted/30',
			].join(' ')}
		>
			<span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
			<span className={['font-semibold tabular-nums', isSubMetric ? 'text-xl' : 'text-2xl'].join(' ')}>
				{value}
			</span>
		</div>
	);
}
