import { captureNodeToPng } from './capture';

/** PNG-снимок отчёта. Возвращает data URL. */
export async function generateReportPng(node: HTMLElement): Promise<string> {
	return captureNodeToPng(node);
}
