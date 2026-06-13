'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';

import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { calculateChartData } from '@/lib/chart-utils';
import { Label } from '@/components/ui/label';
import { CFDChart } from './CFDChart';
import { BacklogChart } from './BacklogChart';

export function ChartsSection() {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
	const [zoomToRange, setZoomToRange] = useState(false);

	useEffect(() => {
		if (periods.length === 0) return;

		const selectedExists = periods.some((p) => p.id === selectedPeriodId);
		if (!selectedPeriodId || !selectedExists) {
			setSelectedPeriodId(periods[0].id);
		}
	}, [periods, selectedPeriodId]);

	const sortedPeriods = useMemo(
		() => [...periods].sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date))),
		[periods],
	);

	const selectedSortedIndex = useMemo(() => {
		const idx = sortedPeriods.findIndex((p) => p.id === selectedPeriodId);
		return idx === -1 ? 0 : idx;
	}, [sortedPeriods, selectedPeriodId]);

	const allChartData = useMemo(
		() => calculateChartData(periods, tasks, periodStatistics),
		[periods, tasks, periodStatistics],
	);

	const chartData = useMemo(
		() => allChartData.slice(0, selectedSortedIndex + 1),
		[allChartData, selectedSortedIndex],
	);

	const backlogData = chartData;

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
			<div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<BacklogChart
						data={backlogData}
						dataKey="uncompleted_critical"
						color="#f87171"
						title="Кумулятивный остаток критичных тикетов"
						zoomToRange={zoomToRange}
					/>
					<BacklogChart
						data={backlogData}
						dataKey="uncompleted_non_critical"
						color="#fb923c"
						title="Кумулятивный остаток некритичных тикетов"
						zoomToRange={zoomToRange}
					/>
				</div>
				<div className="flex items-center gap-2 mt-2">
					<input
						id="backlog-zoom"
						type="checkbox"
						checked={zoomToRange}
						onChange={(e) => setZoomToRange(e.target.checked)}
						className="h-4 w-4 cursor-pointer"
					/>
					<Label htmlFor="backlog-zoom" className="cursor-pointer font-normal">
						Масштабировать по диапазону данных
					</Label>
				</div>
			</div>
		</div>
	);
}
