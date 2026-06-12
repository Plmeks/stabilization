import * as React from 'react';

interface StatsMetricGroupProps {
	title: string;
	children: React.ReactNode;
}

export default function StatsMetricGroup({ title, children }: StatsMetricGroupProps) {
	return (
		<div className="border-b pb-4">
			<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
				{title}
			</p>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{children}
			</div>
		</div>
	);
}
