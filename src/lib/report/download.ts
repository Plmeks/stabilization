import dayjs from 'dayjs';
import type { ReportFormat } from './types';

/** Имя файла отчёта вида stability-report_26.06.2026.pdf */
export function reportFileName(format: ReportFormat): string {
	return `stability-report_${dayjs().format('DD.MM.YYYY')}.${format}`;
}

/** Инициирует скачивание Blob или data URL в браузере. */
export function triggerDownload(source: Blob | string, fileName: string): void {
	const url = typeof source === 'string' ? source : URL.createObjectURL(source);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	if (typeof source !== 'string') {
		// Освобождаем object URL после того, как браузер начал скачивание.
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
}
