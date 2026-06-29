'use client';

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { FileText, FileSpreadsheet, Image as ImageIcon, Download, Loader2 } from 'lucide-react';

import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodStatisticsAtom } from '@/atoms/statsAtom';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { PeriodMultiSelect } from '@/components/shared/PeriodMultiSelect';
import { Button } from '@/components/ui/button';
import { buildReportData } from '@/lib/report/build-report-data';
import { generateReportCsv } from '@/lib/report/generate-csv';
import { generateReportPng } from '@/lib/report/generate-png';
import { generateReportPdf } from '@/lib/report/generate-pdf';
import { reportFileName, triggerDownload } from '@/lib/report/download';
import type { ReportData, ReportFormat } from '@/lib/report/types';
import { ReportDocument } from './ReportDocument';
import { FormatCard } from './FormatCard';

interface DownloadReportModalProps {
	open: boolean;
	onClose: () => void;
	/**
	 * Начальный выбор периодов (Графики): модалка стартует с этого набора, но
	 * дальше правит свой локальный выбор — обратно на страницу ничего не пишется
	 * (связь односторонняя). Без него (Статистика) — свой выбор, все по умолчанию.
	 */
	initialValue?: string[];
}

const FORMATS: { id: ReportFormat; icon: typeof FileText; title: string; hint: string }[] = [
	{ id: 'pdf', icon: FileText, title: 'PDF', hint: 'Цифры + графики' },
	{ id: 'png', icon: ImageIcon, title: 'PNG', hint: 'Снимок отчёта' },
	{ id: 'csv', icon: FileSpreadsheet, title: 'CSV', hint: 'только цифры' },
];

export function DownloadReportModal({ open, onClose, initialValue }: DownloadReportModalProps) {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);
	const periodStatistics = useAtomValue(periodStatisticsAtom);

	// Локальный выбор модалки. Стартовое значение — initialValue (Графики, выбор
	// страницы) либо null (Статистика → по умолчанию все). Правки остаются здесь
	// и наружу не уходят. На Графиках модалка ремоунтится на каждое открытие
	// (см. DownloadReportButton), поэтому стартовое значение всегда актуально.
	const [selectedIds, setSelectedIds] = React.useState<string[] | null>(initialValue ?? null);
	const [format, setFormat] = React.useState<ReportFormat>('pdf');
	const [generating, setGenerating] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const effectiveIds = selectedIds ?? periods.map((p) => p.id);

	// Капчур-данные для оффскрин-рендера (только PDF/PNG).
	const [capture, setCapture] = React.useState<{ data: ReportData; format: 'pdf' | 'png' } | null>(null);
	const docRef = React.useRef<HTMLDivElement>(null);

	// onClose через ref: эффект захвата не должен пересоздаваться (и отменять
	// генерацию на полпути) из-за смены идентичности пропа onClose.
	const onCloseRef = React.useRef(onClose);
	React.useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	const handleClose = () => {
		setError(null);
		onClose();
	};

	// Снимок оффскрин-отчёта после его отрисовки.
	React.useEffect(() => {
		if (!capture) return;
		let cancelled = false;

		(async () => {
			try {
				// Ждём кадр отрисовки + небольшой запас на раскладку графиков.
				await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
				await new Promise((r) => setTimeout(r, 250));
				if (cancelled) return;

				const node = docRef.current;
				if (!node) throw new Error('Не удалось подготовить отчёт');

				// Страховка от зависшего снимка (например, не загрузился шрифт),
				// чтобы модалка не осталась заблокированной навсегда.
				const work = capture.format === 'png' ? generateReportPng(node) : generateReportPdf(node);
				const timeout = new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Таймаут генерации отчёта')), 30000),
				);
				const result = await Promise.race([work, timeout]);
				triggerDownload(result, reportFileName(capture.format));

				if (!cancelled) {
					setCapture(null);
					setGenerating(false);
					onCloseRef.current();
				}
			} catch (e) {
				if (cancelled) return;
				console.error('Ошибка генерации отчёта:', e);
				setError('Не удалось сформировать отчёт. Попробуйте ещё раз.');
				setCapture(null);
				setGenerating(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [capture]);

	const handleDownload = async () => {
		setError(null);
		if (effectiveIds.length < 2) {
			setError('Для отчёта нужно выбрать минимум два периода.');
			return;
		}
		const data = buildReportData(effectiveIds, periods, tasks, periodStatistics);
		if (!data) {
			setError('Выберите хотя бы один период.');
			return;
		}

		setGenerating(true);

		if (format === 'csv') {
			try {
				triggerDownload(generateReportCsv(data), reportFileName('csv'));
				setGenerating(false);
				onClose();
			} catch (e) {
				console.error('Ошибка генерации CSV:', e);
				setError('Не удалось сформировать CSV.');
				setGenerating(false);
			}
			return;
		}

		// PDF/PNG: монтируем оффскрин-документ, снимок снимется в эффекте выше.
		setCapture({ data, format });
	};

	return (
		<ModalWrapper
			open={open}
			onClose={generating ? () => {} : handleClose}
			title="Скачать отчёт"
			footer={
				<>
					<Button variant="outline" onClick={handleClose} disabled={generating}>
						Отмена
					</Button>
					<Button onClick={handleDownload} disabled={generating || effectiveIds.length < 2}>
						{generating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Формирую…
							</>
						) : (
							<>
								<Download className="h-4 w-4" />
								Скачать отчёт
							</>
						)}
					</Button>
				</>
			}
		>
			<div className="space-y-5">
				<div className="space-y-2">
					<span className="text-sm font-medium">Периоды</span>
					<PeriodMultiSelect
						periods={periods}
						value={effectiveIds}
						onChange={(ids) => {
							setSelectedIds(ids);
							setError(null);
						}}
						portalled={false}
					/>
					{effectiveIds.length < 2 && (
						<p className="text-xs text-muted-foreground">
							Для отчёта нужно выбрать минимум два периода.
						</p>
					)}
				</div>

				<div className="space-y-2">
					<span className="text-sm font-medium">Формат</span>
					<div role="radiogroup" className="grid grid-cols-3 gap-3">
						{FORMATS.map((f) => (
							<FormatCard
								key={f.id}
								icon={f.icon}
								title={f.title}
								hint={f.hint}
								selected={format === f.id}
								onSelect={() => {
									setFormat(f.id);
									setError(null);
								}}
							/>
						))}
					</div>
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>

			{/* Оффскрин-рендер отчёта для снимка PDF/PNG */}
			{capture && (
				<div
					aria-hidden
					style={{
						position: 'fixed',
						left: '-100000px',
						top: 0,
						pointerEvents: 'none',
						zIndex: -1,
					}}
				>
					<ReportDocument ref={docRef} data={capture.data} />
				</div>
			)}
		</ModalWrapper>
	);
}
