import type { ReportData } from './types';

/** Экранирование значения для CSV с разделителем `;`. */
function cell(value: string | number): string {
	const str = String(value);
	if (/[";\n]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function row(label: string, value: string | number): string {
	return `${cell(label)};${cell(value)}`;
}

/**
 * Формирует CSV «только цифры» за период.
 * UTF-8 BOM + разделитель `;` — чтобы Excel (в т.ч. русскоязычный) корректно
 * распознал кодировку и колонки.
 */
export function generateReportCsv(data: ReportData): Blob {
	const { metrics, periodLabel, scopeLabel, generatedAt, comment, isLocked } = data;

	const lines: string[] = [
		row('Отчёт', 'STABANA — отчёт за период'),
		row('Команда', 'Видеозвонки'),
		row('Период', periodLabel),
		row('Периоды в отчёте', scopeLabel),
		row('Сформировано', generatedAt),
		row('Данные', isLocked ? 'Зафиксированные' : 'Динамические'),
		'',
		'Показатель;Значение',

		row('Добавлено в бэклог', metrics.added_to_backlog),
		row('Из них критических', metrics.added_critical),
		row('Решено всего', metrics.resolved_total),
		row('Решено критических', metrics.resolved_critical),
		row('В работе', metrics.in_progress),
		row('В тесте', metrics.in_testing),
		row('В блоке', metrics.in_block),
		'',
		row('Всего проблем (накопительно)', metrics.total_problems_cumulative),
		row('Выполнено (накопительно)', metrics.completed_cumulative),
		'',
		row('Незавершённые — всего', metrics.uncompleted),
		row('Незавершённые — критические', metrics.uncompleted_critical),
		row('Незавершённые — некритические', metrics.uncompleted_non_critical),
		'',
		row('WIP — всего', metrics.wip_total),
		row('WIP — в работе', metrics.in_progress),
		row('WIP — в тесте', metrics.in_testing),
		row('WIP — в блоке', metrics.in_block),
		'',
		row('Выполнено за период — всего', metrics.resolved_total),
		row('Выполнено за период — критические', metrics.resolved_critical),
		row('Выполнено за период — некритические', metrics.resolved_non_critical),
		'',
		row('Добавлено за период — всего', metrics.added_to_backlog),
		row('Добавлено за период — критические', metrics.added_critical),
		row('Добавлено за период — некритические', metrics.added_non_critical),
	];

	if (comment && comment.trim()) {
		lines.push('', row('Комментарий', comment.trim()));
	}

	const csv = '﻿' + lines.join('\r\n');
	return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
