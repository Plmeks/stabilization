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
import { PageHeader } from '@/components/shared/PageHeader';
import { DownloadReportButton } from '@/components/report/DownloadReportButton';

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
	const [isAllExpanded, setIsAllExpanded] = React.useState(true);

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
		<div className="p-0 sm:p-6 space-y-4 sm:space-y-5">
			{sortedPeriods.length > 0 && (
				<PageHeader
					eyebrow="Отчёт за период"
					title="Отчёт в цифрах"
					actions={
						<>
							<DownloadReportButton />
							<Button variant="outline" size="sm" onClick={toggleAll} className='md:w-[8rem] w-fit'>
								{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
							</Button>
						</>
					}
				/>
			)}
				{sortedPeriods.map((period) => {
				const statistics = periodStatistics.find((s) => s.period_id === period.id) ?? null;
				const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks, periodStatistics);

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
