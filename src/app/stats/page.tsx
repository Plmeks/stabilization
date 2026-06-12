'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { calculateDynamicMetrics } from '@/lib/stats-utils';
import StatsPeriodCard from '@/components/stats/StatsPeriodCard';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	const sortedPeriods = [...periods].sort((a, b) =>
		dayjs(b.start_date).diff(dayjs(a.start_date)),
	);

	const [expandedPeriods, setExpandedPeriods] = React.useState<Set<string>>(
		new Set(sortedPeriods.length > 0 ? [sortedPeriods[0].id] : []),
	);
	const expandedInitialized = React.useRef(false);
	const [isAllExpanded, setIsAllExpanded] = React.useState(false);

	React.useEffect(() => {
		if (!expandedInitialized.current && sortedPeriods.length > 0) {
			expandedInitialized.current = true;
			setExpandedPeriods(new Set([sortedPeriods[0].id]));
		}
	}, [sortedPeriods]);

	const togglePeriod = (periodId: string) => {
		setExpandedPeriods((prev) => {
			const next = new Set(prev);
			if (next.has(periodId)) {
				next.delete(periodId);
			} else {
				next.add(periodId);
			}
			return next;
		});
	};

	const toggleAll = () => {
		if (isAllExpanded) {
			setExpandedPeriods(new Set());
			setIsAllExpanded(false);
		} else {
			setExpandedPeriods(new Set(sortedPeriods.map((p) => p.id)));
			setIsAllExpanded(true);
		}
	};

	return (
		<div className="p-6 space-y-5">
			{sortedPeriods.length > 0 && (
				<div className="flex justify-end">
					<Button variant="outline" size="sm" onClick={toggleAll}>
						{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
					</Button>
				</div>
			)}
				{sortedPeriods.map((period) => {
				const statistics = periodStatistics.find((s) => s.period_id === period.id) ?? null;
				const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks);

				return (
					<StatsPeriodCard
						key={period.id}
						period={period}
						statistics={statistics}
						dynamicMetrics={dynamicMetrics}
						isExpanded={expandedPeriods.has(period.id)}
						onToggle={() => togglePeriod(period.id)}
					/>
				);
			})}
		</div>
	);
}
