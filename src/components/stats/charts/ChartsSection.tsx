'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useAtomValue } from 'jotai';

import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { calculateChartData } from '@/lib/chart-utils';
import { CFDChart } from './CFDChart';
import { BacklogChart } from './BacklogChart';

export function ChartsSection() {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	const chartData = useMemo(
		() => calculateChartData(periods, tasks, periodStatistics),
		[periods, tasks, periodStatistics],
	);

	const backlogData = chartData.slice(1);

	if (periods.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6 mb-6">
			<CFDChart data={chartData} />
			<BacklogChart
				data={backlogData}
				dataKey="uncompleted_critical"
				color="#f87171"
				title="Кумулятивный остаток критичных тикетов"
			/>
			<BacklogChart
				data={backlogData}
				dataKey="uncompleted_non_critical"
				color="#fb923c"
				title="Кумулятивный остаток некритичных тикетов"
			/>
		</div>
	);
}
