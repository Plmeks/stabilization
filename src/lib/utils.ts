import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import type { Period, Task } from '@/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPeriodLabel(period: Period): string {
	const start = dayjs(period.start_date).format('DD.MM');
	const end = dayjs(period.end_date).format('DD.MM.YYYY');
	return `${start} - ${end}`;
}

export function detectUrls(text: string): Array<{ text: string; url?: string }> {
	const urlRegex = /https?:\/\/[^\s]+/g;
	const segments: Array<{ text: string; url?: string }> = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = urlRegex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, match.index) });
		}
		segments.push({ text: match[0], url: match[0] });
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex) });
	}

	return segments;
}

export function isTaskActive(task: Task): boolean {
	return task.taken_into_work_at !== null && task.status !== 'Завершена';
}

export function isTaskCompleted(task: Task): boolean {
	return task.status === 'Завершена';
}
