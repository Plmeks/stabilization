import { atom } from 'jotai';
import type { PeriodStatistics } from '@/types';
import {
	fetchAllPeriodStatistics,
	createPeriodStatistics,
	updatePeriodStatistics,
} from '@/lib/supabase/dal';
import { tasksAtom } from '@/atoms/tasksAtom';

type MetricsPayload = Pick<
	PeriodStatistics,
	'added_to_backlog' | 'added_critical' | 'resolved_total' | 'resolved_critical' | 'in_progress' | 'in_testing'
>;

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
		const tasks = get(tasksAtom).filter((t) => t.period_id === periodId);

		const metrics: MetricsPayload = {
			added_to_backlog: tasks.filter((t) => t.status !== null).length,
			added_critical: tasks.filter((t) => t.status !== null && t.priority === 'Авария').length,
			resolved_total: tasks.filter((t) => t.status === 'Завершена').length,
			resolved_critical: tasks.filter((t) => t.status === 'Завершена' && t.priority === 'Авария').length,
			in_progress: tasks.filter((t) => t.status === 'В работе').length,
			in_testing: tasks.filter((t) => t.status === 'В тесте').length,
		};

		const created = await createPeriodStatistics(periodId, metrics);
		set(periodStatisticsAtom, [...get(periodStatisticsAtom), created]);
	},
);

export const updatePeriodStatisticsAtom = atom(
	null,
	async (get, set, { id, metrics }: { id: string; metrics: MetricsPayload }) => {
		const previous = get(periodStatisticsAtom);
		set(periodStatisticsAtom, previous.map((s) => (s.id === id ? { ...s, ...metrics } : s)));

		try {
			const updated = await updatePeriodStatistics(id, metrics);
			set(periodStatisticsAtom, get(periodStatisticsAtom).map((s) => (s.id === id ? updated : s)));
		} catch (error) {
			set(periodStatisticsAtom, previous);
			throw error;
		}
	},
);
