'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { cn, formatPeriodLabel } from '@/lib/utils';
import type { Period, PeriodStatistics } from '@/types';
import type { DynamicMetrics } from '@/lib/stats-utils';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import StatsMetricItem from './StatsMetricItem';
import StatsMetricGroup from './StatsMetricGroup';
import StatsComment from './StatsComment';
import LockMetricsButton from './LockMetricsButton';
import { EditMetricsModal } from '@/components/modals/EditMetricsModal';
import { deletePeriodStatisticsAtom } from '@/atoms/statsAtom';
import { roleColor, type MetricRole } from '@/lib/metric-role';

interface StatsPeriodCardProps {
	period: Period;
	statistics: PeriodStatistics | null;
	dynamicMetrics: DynamicMetrics;
	isExpanded?: boolean;
	onToggle?: () => void;
}

export default function StatsPeriodCard({
	period,
	statistics,
	dynamicMetrics,
	isExpanded = true,
	onToggle,
}: StatsPeriodCardProps) {
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
	const [deleteLoading, setDeleteLoading] = React.useState(false);
	const deleteStatistics = useSetAtom(deletePeriodStatisticsAtom);

	const metrics = statistics ?? dynamicMetrics;

	// KPI с цветной верхней кромкой — как в шапке отчёта.
	const kpis: { label: string; value: number; border: string; role: MetricRole }[] = [
		{ label: 'Всего проблем', value: metrics.total_problems_cumulative, border: 'var(--foreground)', role: 'neutral' },
		{ label: 'Выполнено', value: metrics.completed_cumulative, border: 'var(--success)', role: 'success' },
		{ label: 'Незавершённые', value: metrics.uncompleted, border: 'var(--warn)', role: 'neutral' },
		{ label: 'WIP', value: metrics.wip_total, border: 'var(--wip)', role: 'neutral' },
	];

	const handleDeleteConfirm = async () => {
		setDeleteLoading(true);
		try {
			await deleteStatistics(period.id);
			setDeleteConfirmOpen(false);
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<div className="panel shadow-sm overflow-hidden">
			<div
				className="flex items-center justify-between px-5 py-4 bg-muted cursor-pointer select-none transition-colors hover:bg-secondary"
				onClick={onToggle}
			>
				<div className="flex items-center gap-2">
					<ChevronDown
						className={cn(
							'h-4 w-4 text-muted-foreground transition-transform',
							isExpanded ? '' : '-rotate-90',
						)}
					/>
					<span className="font-medium text-sm tabular-nums">{formatPeriodLabel(period)}</span>
				</div>
				{statistics !== null && (
					<div
						className="flex items-center gap-1"
						onClick={(e) => e.stopPropagation()}
					>
						<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
							<Pencil className="h-4 w-4 text-warn" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive hover:text-destructive"
							onClick={() => setDeleteConfirmOpen(true)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{isExpanded && (
				<div className="px-5 py-6 sm:px-6">
					{/* KPI с цветной верхней кромкой — как в шапке отчёта. */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{kpis.map((k) => (
							<div
								key={k.label}
								className="rounded-xl border border-border bg-card px-4 py-3.5"
								style={{ borderTopWidth: 3, borderTopColor: k.border }}
							>
								<div
									className="text-3xl font-semibold tracking-tight tabular-nums"
									style={{ color: roleColor(k.value, k.role) }}
								>
									{k.value}
								</div>
								<div className="eyebrow mt-1.5">{k.label}</div>
							</div>
						))}
					</div>

					{/* Группы метрик в две колонки — числа раскрашены по ролям. */}
					<div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
						<StatsMetricGroup title="Краткая статистика">
							<StatsMetricItem label="Добавлено в бэклог" value={metrics.added_to_backlog} />
							<StatsMetricItem label="Из них критических" value={metrics.added_critical} role="danger" />
							<StatsMetricItem label="Решено всего" value={metrics.resolved_total} role="success" />
							<StatsMetricItem label="Решено критических" value={metrics.resolved_critical} role="success" />
							<StatsMetricItem label="В работе" value={metrics.in_progress} />
							<StatsMetricItem label="В тесте" value={metrics.in_testing} />
							<StatsMetricItem label="В блоке" value={metrics.in_block} role="danger" />
						</StatsMetricGroup>

						<StatsMetricGroup title="Накопительные">
							<StatsMetricItem label="Всего проблем" value={metrics.total_problems_cumulative} />
							<StatsMetricItem label="Выполнено" value={metrics.completed_cumulative} role="success" />
						</StatsMetricGroup>

						<StatsMetricGroup title="Незавершённые">
							<StatsMetricItem label="Всего" value={metrics.uncompleted} />
							<StatsMetricItem label="Критические" value={metrics.uncompleted_critical} role="danger" />
							<StatsMetricItem label="Некритические" value={metrics.uncompleted_non_critical} role="warn" />
						</StatsMetricGroup>

						<StatsMetricGroup title="WIP">
							<StatsMetricItem label="Всего" value={metrics.wip_total} />
							<StatsMetricItem label="В работе" value={metrics.in_progress} />
							<StatsMetricItem label="В тесте" value={metrics.in_testing} />
							<StatsMetricItem label="В блоке" value={metrics.in_block} role="danger" />
						</StatsMetricGroup>

						<StatsMetricGroup title="Выполнено за период">
							<StatsMetricItem label="Всего" value={metrics.resolved_total} role="success" />
							<StatsMetricItem label="Критические" value={metrics.resolved_critical} role="success" />
							<StatsMetricItem label="Некритические" value={metrics.resolved_non_critical} role="success" />
						</StatsMetricGroup>

						<StatsMetricGroup title="Добавлено за период">
							<StatsMetricItem label="Всего" value={metrics.added_to_backlog} />
							<StatsMetricItem label="Критические" value={metrics.added_critical} role="danger" />
							<StatsMetricItem label="Некритические" value={metrics.added_non_critical} role="warn" />
						</StatsMetricGroup>
					</div>

					{statistics !== null && (
						<div className="mt-8">
							<p className="eyebrow mb-3">Комментарий</p>
							<StatsComment
								statisticsId={statistics.id}
								initialComment={statistics.comment}
							/>
						</div>
					)}

					<div className="mt-6 flex items-center justify-between gap-3">
						{statistics !== null ? (
							<p className="text-xs text-muted-foreground tabular-nums">
								Зафиксировано: {dayjs(statistics.locked_at).format('DD.MM.YYYY HH:mm')}
							</p>
						) : (
							<span />
						)}
						{statistics === null && <LockMetricsButton periodId={period.id} />}
					</div>
				</div>
			)}

			{statistics !== null && editOpen && (
				<EditMetricsModal
					key={statistics.id}
					open={editOpen}
					onClose={() => setEditOpen(false)}
					statistics={statistics}
				/>
			)}

			<ConfirmDialog
				open={deleteConfirmOpen}
				onClose={() => setDeleteConfirmOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Удалить зафиксированную статистику"
				message="Зафиксированные данные будут удалены. Статистика снова станет динамической."
				loading={deleteLoading}
			/>
		</div>
	);
}
