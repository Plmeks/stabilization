'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';

import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { calculateChartData } from '@/lib/chart-utils';
import { Label } from '@/components/ui/label';
import { PeriodMultiSelect } from '@/components/shared/PeriodMultiSelect';
import { CFDChart } from './CFDChart';
import { BacklogChart } from './BacklogChart';

interface ChartsSectionProps {
	/** Выбранные периоды — общее состояние со страницей (и с кнопкой «Скачать отчёт»). */
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
}

export function ChartsSection({ selectedIds, onSelectionChange }: ChartsSectionProps) {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	const [zoomToRange, setZoomToRange] = useState(false);

	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

	const allChartData = useMemo(
		() => calculateChartData(periods, tasks, periodStatistics),
		[periods, tasks, periodStatistics],
	);

	// Фильтр-вид: показываем только выбранные точки в хронологическом порядке
	// (allChartData уже отсортирован от старых к новым). Кумулятивные значения
	// каждой точки самодостаточны, поэтому пересчёт не нужен.
	const chartData = useMemo(
		() => allChartData.filter((p) => selectedSet.has(p.periodId)),
		[allChartData, selectedSet],
	);

	const backlogData = chartData;

	if (periods.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6 mb-6">
			<div className="flex flex-col gap-1.5 sm:max-w-md">
				<label className="text-sm font-medium">Периоды на графике</label>
				<PeriodMultiSelect periods={periods} value={selectedIds} onChange={onSelectionChange} />
			</div>
			{chartData.length < 2 ? (
				<p className="py-12 text-center text-sm text-muted-foreground">
					Выберите хотя бы два периода
				</p>
			) : (
			<>
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
			</>
			)}
		</div>
	);
}
