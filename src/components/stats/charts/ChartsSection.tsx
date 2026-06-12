'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';

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

	const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

	useEffect(() => {
		if (periods.length === 0) return;

		const selectedExists = periods.some((p) => p.id === selectedPeriodId);
		if (!selectedPeriodId || !selectedExists) {
			setSelectedPeriodId(periods[0].id);
		}
	}, [periods, selectedPeriodId]);

	const filteredPeriods = useMemo(() => {
		if (!selectedPeriodId) return periods;

		const selectedIndex = periods.findIndex((p) => p.id === selectedPeriodId);
		if (selectedIndex === -1) return periods;

		return periods.slice(selectedIndex).reverse();
	}, [periods, selectedPeriodId]);

	const chartData = useMemo(
		() => calculateChartData(filteredPeriods, tasks, periodStatistics),
		[filteredPeriods, tasks, periodStatistics],
	);

	const backlogData = chartData.slice(1);

	if (periods.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6 mb-6">
			<div className="flex items-center gap-4">
				<label htmlFor="period-filter" className="text-sm font-medium">
					Период:
				</label>
				<select
					id="period-filter"
					value={selectedPeriodId}
					onChange={(e) => setSelectedPeriodId(e.target.value)}
					className="px-3 py-2 border rounded-md text-sm bg-background"
				>
					{periods.map((period) => (
						<option key={period.id} value={period.id}>
							{dayjs(period.start_date).format('DD.MM.YYYY')} – {dayjs(period.end_date).format('DD.MM.YYYY')}
						</option>
					))}
				</select>
			</div>
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
