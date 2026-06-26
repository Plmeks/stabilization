'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadReportModal } from './DownloadReportModal';

/** Кнопка «Скачать отчёт» на странице Статистика + модалка выбора периода/формата. */
export function DownloadReportButton() {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className="w-fit self-end"
			>
				<Download className="h-4 w-4" />
				Скачать отчёт
			</Button>
			<DownloadReportModal open={open} onClose={() => setOpen(false)} />
		</>
	);
}
