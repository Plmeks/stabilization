'use client';

import * as React from 'react';
import type { ReportData, ReportMetrics } from '@/lib/report/types';
import { ReportCharts } from './ReportCharts';

const COLOR = {
	ink: '#0f172a',
	success: '#16a34a',
	danger: '#dc2626',
	warn: '#ea580c',
	wip: '#3b82f6',
} as const;

// Роль числа определяет цвет:
//  neutral — всегда чёрный (итоги, в работе, в тесте, бэклог)
//  success — зелёный если > 0 (решено/выполнено — это успех), иначе чёрный
//  danger  — красный если > 0 (критичные незавершённые/добавленные, в блоке), иначе чёрный
//  warn    — оранжевый если > 0 (некритичные незавершённые/добавленные), иначе чёрный
//  wip     — синий если > 0 (в работе/в тесте/WIP — поток задач), иначе чёрный
type Role = 'neutral' | 'success' | 'danger' | 'warn' | 'wip';

type Metric = { label: string; value: number; role: Role };
type Group = { title: string; metrics: Metric[] };

function valueColor(metric: Metric): string {
	if (metric.role === 'neutral') return COLOR.ink;
	return metric.value > 0 ? COLOR[metric.role] : COLOR.ink;
}

function buildGroups(m: ReportMetrics): Group[] {
	return [
		{
			title: 'Краткая статистика',
			metrics: [
				{ label: 'Добавлено в бэклог', value: m.added_to_backlog, role: 'neutral' },
				{ label: 'Из них критических', value: m.added_critical, role: 'danger' },
				{ label: 'Решено всего', value: m.resolved_total, role: 'success' },
				{ label: 'Решено критических', value: m.resolved_critical, role: 'success' },
				{ label: 'В работе', value: m.in_progress, role: 'wip' },
				{ label: 'В тесте', value: m.in_testing, role: 'wip' },
				{ label: 'В блоке', value: m.in_block, role: 'danger' },
			],
		},
		{
			title: 'Накопительные',
			metrics: [
				{ label: 'Всего проблем', value: m.total_problems_cumulative, role: 'neutral' },
				{ label: 'Выполнено', value: m.completed_cumulative, role: 'success' },
			],
		},
		{
			title: 'Незавершённые',
			metrics: [
				{ label: 'Всего', value: m.uncompleted, role: 'neutral' },
				{ label: 'Критические', value: m.uncompleted_critical, role: 'danger' },
				{ label: 'Некритические', value: m.uncompleted_non_critical, role: 'warn' },
			],
		},
		{
			title: 'WIP',
			metrics: [
				{ label: 'Всего', value: m.wip_total, role: 'wip' },
				{ label: 'В работе', value: m.in_progress, role: 'wip' },
				{ label: 'В тесте', value: m.in_testing, role: 'wip' },
				{ label: 'В блоке', value: m.in_block, role: 'danger' },
			],
		},
		{
			title: 'Выполнено за период',
			metrics: [
				{ label: 'Всего', value: m.resolved_total, role: 'success' },
				{ label: 'Критические', value: m.resolved_critical, role: 'success' },
				{ label: 'Некритические', value: m.resolved_non_critical, role: 'success' },
			],
		},
		{
			title: 'Добавлено за период',
			metrics: [
				{ label: 'Всего', value: m.added_to_backlog, role: 'neutral' },
				{ label: 'Критические', value: m.added_critical, role: 'danger' },
				{ label: 'Некритические', value: m.added_non_critical, role: 'warn' },
			],
		},
	];
}

type Kpi = { label: string; value: number; border: string; role: Role };

/**
 * Оффскрин-вёрстка отчёта для снимка в PNG/PDF. Самодостаточные стили (явные
 * hex-цвета, системный шрифт с tabular-nums) — отчёт всегда светлый документ
 * независимо от темы приложения и надёжно сериализуется html-to-image.
 *
 * Блоки помечены data-report-section: в PDF каждый стартует с новой страницы
 * (поэтому графики не разрезаются).
 */
export const ReportDocument = React.forwardRef<HTMLDivElement, { data: ReportData }>(
	function ReportDocument({ data }, ref) {
		const { periodLabel, generatedAt, metrics, comment, isLocked } = data;
		const groups = buildGroups(metrics);

		const kpis: Kpi[] = [
			{ label: 'Всего проблем', value: metrics.total_problems_cumulative, border: COLOR.ink, role: 'neutral' },
			{ label: 'Выполнено', value: metrics.completed_cumulative, border: COLOR.success, role: 'success' },
			{ label: 'Незавершённые', value: metrics.uncompleted, border: COLOR.warn, role: 'neutral' },
			{ label: 'WIP', value: metrics.wip_total, border: COLOR.wip, role: 'wip' },
		];

		return (
			<div className="report-doc" ref={ref}>
				<style>{REPORT_CSS}</style>

				{/* Страница 1: цифры */}
				<div data-report-section>
					<header className="report-head">
						<div className="report-head__eyebrow">STABANA · Отчёт за период · Команда Видеозвонки</div>
						<div className="report-head__range">{periodLabel}</div>
						<div className="report-head__meta">
							Сформировано {generatedAt} · {isLocked ? 'зафиксированные данные' : 'динамические данные'}
						</div>
					</header>

					{/* Сигнатура: лента-ключ стабильности — те же цвета, что в CFD */}
					<div className="report-ribbon" aria-hidden>
						<span style={{ background: COLOR.success }} />
						<span style={{ background: COLOR.danger }} />
						<span style={{ background: COLOR.warn }} />
						<span style={{ background: COLOR.wip }} />
					</div>
					<div className="report-key">
						<KeyItem color={COLOR.success} label="Готовые" />
						<KeyItem color={COLOR.danger} label="Критичные" />
						<KeyItem color={COLOR.warn} label="Некритичные" />
						<KeyItem color={COLOR.wip} label="WIP" />
					</div>

					<div className="report-body">
						<section className="report-kpis">
							{kpis.map((kpi) => (
								<div className="report-kpi" key={kpi.label} style={{ borderTopColor: kpi.border }}>
									<div
										className="report-kpi__value"
										style={{ color: valueColor({ label: kpi.label, value: kpi.value, role: kpi.role }) }}
									>
										{kpi.value}
									</div>
									<div className="report-kpi__label">{kpi.label}</div>
								</div>
							))}
						</section>

						<div className="report-groups">
							{groups.map((group) => (
								<section className="report-group" key={group.title}>
									<h3 className="report-group__title">{group.title}</h3>
									<div className="report-group__grid">
										{group.metrics.map((metric) => (
											<div key={metric.label} className="report-metric">
												<div className="report-metric__label">{metric.label}</div>
												<div className="report-metric__value" style={{ color: valueColor(metric) }}>
													{metric.value}
												</div>
											</div>
										))}
									</div>
								</section>
							))}
						</div>

						{comment && comment.trim() && (
							<section className="report-comment">
								<h3 className="report-group__title">Комментарий</h3>
								<p className="report-comment__text">{comment.trim()}</p>
							</section>
						)}
					</div>
				</div>

				{/* Страница 2: графики */}
				<div data-report-section className="report-charts-page">
					<div className="report-charts-page__eyebrow">STABANA · Графики · {periodLabel}</div>
					<ReportCharts data={data.chartData} />
					<footer className="report-foot">
						<span>STABANA · Команда Видеозвонки</span>
						<span>Отчёт за период {periodLabel}</span>
					</footer>
				</div>
			</div>
		);
	},
);

function KeyItem({ color, label }: { color: string; label: string }) {
	return (
		<span className="report-key__item">
			<span className="report-key__dot" style={{ background: color }} />
			{label}
		</span>
	);
}

const REPORT_CSS = `
.report-doc {
	width: 820px;
	background: #ffffff;
	color: #0f172a;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
	font-feature-settings: "tnum";
	font-variant-numeric: tabular-nums;
	line-height: 1.3;
	box-sizing: border-box;
}
.report-doc * { box-sizing: border-box; }

.report-head {
	background: #0f172a;
	padding: 34px 40px 30px;
}
.report-head__eyebrow {
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: #94a3b8;
}
.report-head__range {
	margin-top: 12px;
	font-size: 34px;
	font-weight: 600;
	letter-spacing: -0.01em;
	color: #f8fafc;
}
.report-head__meta {
	margin-top: 10px;
	font-size: 12px;
	color: #94a3b8;
}

.report-ribbon { display: flex; height: 6px; }
.report-ribbon > span { flex: 1; }

.report-key {
	display: flex;
	gap: 28px;
	padding: 14px 40px;
	background: #f8fafc;
	border-bottom: 1px solid #e8eaee;
}
.report-key__item {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	font-weight: 500;
	color: #475569;
}
.report-key__dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

.report-body { padding: 32px 40px 28px; }

.report-kpis {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14px;
}
.report-kpi {
	border: 1px solid #e8eaee;
	border-top: 3px solid #0f172a;
	border-radius: 12px;
	padding: 16px 18px;
	background: #ffffff;
}
.report-kpi__value {
	font-size: 32px;
	font-weight: 600;
	letter-spacing: -0.01em;
}
.report-kpi__label {
	margin-top: 4px;
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #64748b;
}

.report-groups {
	margin-top: 30px;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 22px 28px;
}
.report-group__title {
	margin: 0 0 14px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: #94a3b8;
	padding-bottom: 8px;
	border-bottom: 1px solid #e8eaee;
}
.report-group__grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px 18px;
}
.report-metric {
	display: flex;
	flex-direction: column;
	gap: 3px;
}
.report-metric__label {
	font-size: 12px;
	font-weight: 500;
	color: #475569;
}
.report-metric__value {
	font-size: 22px;
	font-weight: 600;
	letter-spacing: -0.01em;
}

.report-charts-page { padding: 30px 40px 0; }
.report-charts-page__eyebrow {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: #94a3b8;
	padding-bottom: 10px;
	margin-bottom: 20px;
	border-bottom: 1px solid #e8eaee;
}
.report-charts { display: flex; flex-direction: column; gap: 18px; }
.report-charts__row { display: flex; gap: 16px; }
.report-chart__title {
	font-size: 13px;
	font-weight: 600;
	color: #0f172a;
	margin: 0 0 8px;
}

.report-comment {
	margin-top: 30px;
	background: #f8fafc;
	border: 1px solid #e8eaee;
	border-left: 3px solid #0f172a;
	border-radius: 10px;
	padding: 16px 18px;
}
.report-comment .report-group__title { border: 0; padding: 0; margin-bottom: 8px; }
.report-comment__text {
	margin: 0;
	font-size: 13px;
	color: #334155;
	white-space: pre-wrap;
	line-height: 1.5;
}

.report-foot {
	margin-top: 28px;
	padding: 16px 0;
	border-top: 1px solid #e8eaee;
	display: flex;
	justify-content: space-between;
	font-size: 11px;
	color: #94a3b8;
	letter-spacing: 0.04em;
}
`;
