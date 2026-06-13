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
		<div className="border rounded-xl shadow-sm overflow-hidden">
			<div
				className="flex items-center justify-between px-5 py-4 bg-muted/40 cursor-pointer select-none"
				onClick={onToggle}
			>
				<div className="flex items-center gap-2">
					<ChevronDown
						className={cn(
							'h-4 w-4 text-muted-foreground transition-transform',
							isExpanded ? '' : '-rotate-90',
						)}
					/>
					<span className="font-medium text-sm">{formatPeriodLabel(period)}</span>
				</div>
				{statistics !== null && (
					<div
						className="flex items-center gap-1"
						onClick={(e) => e.stopPropagation()}
					>
						<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
							<Pencil className="h-4 w-4" />
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
				<div className="px-5 py-5 space-y-4">
					<StatsMetricGroup title="Краткая статистика">
						<StatsMetricItem label="Добавлено в бэклог" value={metrics.added_to_backlog} />
						<StatsMetricItem label="Из них критических" value={metrics.added_critical} isSubMetric />
						<StatsMetricItem label="Решено всего" value={metrics.resolved_total} />
						<StatsMetricItem label="Решено критических" value={metrics.resolved_critical} isSubMetric />
						<StatsMetricItem label="В работе" value={metrics.in_progress} />
						<StatsMetricItem label="В тесте" value={metrics.in_testing} />
						<StatsMetricItem label="В блоке" value={metrics.in_block} />
					</StatsMetricGroup>

					<StatsMetricGroup title="Накопительные">
						<StatsMetricItem label="Всего проблем" value={metrics.total_problems_cumulative} />
						<StatsMetricItem label="Выполнено" value={metrics.completed_cumulative} />
					</StatsMetricGroup>

					<StatsMetricGroup title="Незавершенные">
						<StatsMetricItem label="Всего" value={metrics.uncompleted} />
						<StatsMetricItem label="Критические" value={metrics.uncompleted_critical} isSubMetric />
						<StatsMetricItem label="Некритические" value={metrics.uncompleted_non_critical} isSubMetric />
					</StatsMetricGroup>

					<StatsMetricGroup title="WIP">
						<StatsMetricItem label="Всего" value={metrics.wip_total} />
						<StatsMetricItem label="В работе" value={metrics.in_progress} isSubMetric />
						<StatsMetricItem label="В тесте" value={metrics.in_testing} isSubMetric />
						<StatsMetricItem label="В блоке" value={metrics.in_block} isSubMetric />
					</StatsMetricGroup>

					<StatsMetricGroup title="Выполнено за период">
						<StatsMetricItem label="Всего" value={metrics.resolved_total} />
						<StatsMetricItem label="Критические" value={metrics.resolved_critical} isSubMetric />
						<StatsMetricItem label="Некритические" value={metrics.resolved_non_critical} isSubMetric />
					</StatsMetricGroup>

					<StatsMetricGroup title="Добавлено за период">
						<StatsMetricItem label="Всего" value={metrics.added_to_backlog} />
						<StatsMetricItem label="Критические" value={metrics.added_critical} isSubMetric />
						<StatsMetricItem label="Некритические" value={metrics.added_non_critical} isSubMetric />
					</StatsMetricGroup>

					{statistics !== null && (
						<div className="pt-4">
							<p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
								Комментарий
							</p>
							<StatsComment
								statisticsId={statistics.id}
								initialComment={statistics.comment}
							/>
						</div>
					)}

					{statistics !== null ? (
						<p className="text-xs text-muted-foreground">
							Зафиксировано: {dayjs(statistics.locked_at).format('DD.MM.YYYY HH:mm')}
						</p>
					) : (
						<div className="flex justify-end">
							<LockMetricsButton periodId={period.id} />
						</div>
					)}
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
