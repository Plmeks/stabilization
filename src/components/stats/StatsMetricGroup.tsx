import * as React from 'react';

interface StatsMetricGroupProps {
	title: string;
	children: React.ReactNode;
}

/** Группа метрик: eyebrow-заголовок с волоском + 2-колоночная сетка чисел (как в отчёте). */
export default function StatsMetricGroup({ title, children }: StatsMetricGroupProps) {
	return (
		<section className="break-inside-avoid">
			<h3 className="eyebrow mb-3 border-b border-border pb-2">{title}</h3>
			<div className="grid grid-cols-2 gap-x-6 gap-y-3.5">{children}</div>
		</section>
	);
}
