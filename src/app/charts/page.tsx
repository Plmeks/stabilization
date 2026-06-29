'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';

import { periodsAtom } from '@/atoms/periodsAtom';
import { ChartsSection } from '@/components/stats/charts/ChartsSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { DownloadReportButton } from '@/components/report/DownloadReportButton';

export default function ChartsPage() {
	const periods = useAtomValue(periodsAtom);

	// Выбор периодов живёт на странице, чтобы выпадашка на графиках и кнопка
	// «Скачать отчёт» делили одно состояние (галочки совпадают). null = ещё не
	// трогали → по умолчанию все; согласование в рендере: новые периоды
	// добавляются сами, удалённые отпадают, снятые галочки остаются снятыми.
	const [selection, setSelection] = useState<{ known: string[]; selected: string[] } | null>(null);

	const currentIds = useMemo(() => periods.map((p) => p.id), [periods]);

	const selectedIds = useMemo(() => {
		if (selection === null) return currentIds;
		const currentSet = new Set(currentIds);
		const knownSet = new Set(selection.known);
		const kept = selection.selected.filter((id) => currentSet.has(id));
		const newlyAdded = currentIds.filter((id) => !knownSet.has(id));
		return newlyAdded.length > 0 ? [...kept, ...newlyAdded] : kept;
	}, [selection, currentIds]);

	const handleSelectionChange = (ids: string[]) => {
		setSelection({ known: currentIds, selected: ids });
	};

	return (
		<div className="flex flex-col gap-4 p-0 sm:gap-5 sm:p-2 md:p-6">
			<PageHeader
				eyebrow="Динамика стабильности"
				title="Графический отчёт"
				actions={
					periods.length > 0 ? <DownloadReportButton initialValue={selectedIds} /> : undefined
				}
			/>
			<ChartsSection selectedIds={selectedIds} onSelectionChange={handleSelectionChange} />
		</div>
	);
}
