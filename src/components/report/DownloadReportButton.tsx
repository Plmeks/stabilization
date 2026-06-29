'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadReportModal } from './DownloadReportModal';

interface DownloadReportButtonProps {
	/**
	 * Начальный выбор периодов (Графики): при каждом открытии модалка
	 * подхватывает текущий выбор страницы. Связь односторонняя — правки внутри
	 * модалки обратно на график не влияют. Без пропса (Статистика) модалка
	 * держит свой выбор (все периоды по умолчанию).
	 */
	initialValue?: string[];
}

/** Кнопка «Скачать отчёт» + модалка выбора периодов/формата. */
export function DownloadReportButton({ initialValue }: DownloadReportButtonProps = {}) {
	const [open, setOpen] = React.useState(false);
	// При seeded-режиме (Графики) ремоунтим модалку на каждое открытие, чтобы
	// она пересеялась текущим выбором страницы (а не показывала прошлый).
	const [openSeq, setOpenSeq] = React.useState(0);
	const seeded = initialValue !== undefined;

	const handleOpen = () => {
		if (seeded) setOpenSeq((s) => s + 1);
		setOpen(true);
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={handleOpen}
				className="w-fit self-end"
			>
				<Download className="h-4 w-4" />
				Скачать отчёт
			</Button>
			<DownloadReportModal
				key={seeded ? openSeq : undefined}
				open={open}
				onClose={() => setOpen(false)}
				initialValue={initialValue}
			/>
		</>
	);
}
