import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import type { Period, Task } from '@/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPeriodLabel(period: Period): string {
	const start = dayjs(period.start_date).format('DD.MM.YYYY');
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

// If the title contains a numeric id (6+ digits, e.g. "call: 0249130:"),
// derive the jabber ticket link, stripping leading zeros: id=249130.
export function extractJabberLink(title: string): string | null {
	const match = title.match(/\d{6,}/);
	if (!match) {
		return null;
	}
	const id = match[0].replace(/^0+/, '') || '0';
	return `http://jabber.bx/view.php?id=${id}`;
}

// Исполнители хранятся в одном текстовом поле как имена через запятую.
// Эти помощники переводят туда-обратно в массив для мультиселекта.
export function parseAssignees(value: string | null | undefined): string[] {
	if (!value) {
		return [];
	}
	return value
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
}

export function serializeAssignees(names: string[]): string | null {
	const cleaned = names.map((name) => name.trim()).filter(Boolean);
	// Уникализируем без учёта регистра, сохраняя первое написание.
	const seen = new Set<string>();
	const unique: string[] = [];
	for (const name of cleaned) {
		const key = name.toLowerCase();
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(name);
		}
	}
	return unique.length > 0 ? unique.join(', ') : null;
}

export function isTaskActive(task: Task): boolean {
	return !isTaskCompleted(task);
}

export function isTaskCompleted(task: Task): boolean {
	return task.status === 'Завершена';
}

// Case-insensitive substring search. Returns true if the (trimmed) query is
// empty, or if any of the provided fields contains the query.
export function matchesQuery(
	query: string,
	...fields: Array<string | null | undefined>
): boolean {
	const q = query.trim().toLowerCase();
	if (!q) {
		return true;
	}
	return fields.some((field) => field != null && field.toLowerCase().includes(q));
}
