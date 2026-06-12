import { atom } from 'jotai';
import type { PeriodStatistics } from '@/types';
import {
	fetchAllPeriodStatistics,
	createPeriodStatistics,
	updatePeriodStatistics,
	updatePeriodStatisticsComment,
	deletePeriodStatistics,
} from '@/lib/supabase/dal';
import { tasksAtom } from '@/atoms/tasksAtom';
import { periodsAtom } from '@/atoms/periodsAtom';
import { calculateDynamicMetrics } from '@/lib/stats-utils';

type MetricsPayload = Omit<PeriodStatistics, 'id' | 'period_id' | 'comment' | 'locked_at' | 'created_at'>;

export const periodStatisticsAtom = atom<PeriodStatistics[]>([]);

export const fetchPeriodStatisticsAtom = atom(
	null,
	async (_get, set) => {
		const stats = await fetchAllPeriodStatistics();
		set(periodStatisticsAtom, stats);
	},
);

export const lockPeriodMetricsAtom = atom(
	null,
	async (get, set, periodId: string) => {
		const allTasks = get(tasksAtom);
		const allPeriods = get(periodsAtom);
		const period = allPeriods.find((p) => p.id === periodId);

		if (!period) {
			throw new Error(`Period not found: ${periodId}`);
		}

		const metrics = calculateDynamicMetrics(period, allPeriods, allTasks);

		const created = await createPeriodStatistics(periodId, { ...metrics, comment: null });
		set(periodStatisticsAtom, [...get(periodStatisticsAtom), created]);
	},
);

export const updatePeriodStatisticsAtom = atom(
	null,
	async (get, set, { id, metrics }: { id: string; metrics: MetricsPayload }) => {
		const previous = get(periodStatisticsAtom);
		set(periodStatisticsAtom, previous.map((s) => (s.id === id ? { ...s, ...metrics } : s)));

		try {
			const existingComment = previous.find((s) => s.id === id)?.comment ?? null;
			const updated = await updatePeriodStatistics(id, { ...metrics, comment: existingComment });
			set(periodStatisticsAtom, get(periodStatisticsAtom).map((s) => (s.id === id ? updated : s)));
		} catch (error) {
			set(periodStatisticsAtom, previous);
			throw error;
		}
	},
);

export const updatePeriodStatisticsCommentAtom = atom(
	null,
	async (get, set, { id, comment }: { id: string; comment: string | null }) => {
		const previous = get(periodStatisticsAtom);
		set(periodStatisticsAtom, previous.map((s) => (s.id === id ? { ...s, comment } : s)));

		try {
			await updatePeriodStatisticsComment(id, comment);
		} catch (error) {
			set(periodStatisticsAtom, previous);
			throw error;
		}
	},
);

export const updatePeriodCommentAtom = atom(
	null,
	async (get, set, { statisticsId, comment }: { statisticsId: string; comment: string | null }) => {
		const previous = get(periodStatisticsAtom);
		set(periodStatisticsAtom, previous.map((s) => (s.id === statisticsId ? { ...s, comment } : s)));

		try {
			await updatePeriodStatisticsComment(statisticsId, comment);
		} catch (error) {
			set(periodStatisticsAtom, previous);
			throw error;
		}
	},
);

export const deletePeriodStatisticsAtom = atom(
	null,
	async (get, set, periodId: string) => {
		const previous = get(periodStatisticsAtom);
		set(periodStatisticsAtom, previous.filter((s) => s.period_id !== periodId));

		try {
			await deletePeriodStatistics(periodId);
		} catch (error) {
			set(periodStatisticsAtom, previous);
			throw error;
		}
	},
);
