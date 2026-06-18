import { atom } from 'jotai';
import type { Period, CreatePeriodInput } from '@/types';
import {
	fetchPeriods,
	createPeriod,
	deletePeriod,
	transferWipTasks,
	resetActivePeriodForDeletion,
} from '@/lib/supabase/dal';

export const periodsAtom = atom<Period[]>([]);

export const periodsLoadingAtom = atom<boolean>(false);

export const fetchPeriodsAtom = atom(
	null,
	async (_get, set) => {
		set(periodsLoadingAtom, true);
		try {
			const periods = await fetchPeriods();
			set(periodsAtom, [...periods].sort((a, b) => {
				const sd = b.start_date.localeCompare(a.start_date);
				if (sd !== 0) return sd;
				return b.end_date.localeCompare(a.end_date);
			}));
		} finally {
			set(periodsLoadingAtom, false);
		}
	},
);

export const createPeriodAtom = atom(
	null,
	async (get, set, input: CreatePeriodInput) => {
		// The period that is latest right now — it will be auto-locked once a newer one appears.
		const previousLatest = get(periodsAtom)[0] ?? null;
		const tempId = `temp-${Date.now()}`;
		const tempPeriod: Period = {
			id: tempId,
			start_date: input.start_date,
			end_date: input.end_date,
			created_at: new Date().toISOString(),
		};

		set(periodsAtom, [tempPeriod, ...get(periodsAtom)].sort((a, b) => {
			const sd = b.start_date.localeCompare(a.start_date);
			if (sd !== 0) return sd;
			return b.end_date.localeCompare(a.end_date);
		}));

		try {
			const realPeriod = await createPeriod(input);
			set(periodsAtom, get(periodsAtom).map((p) => (p.id === tempId ? realPeriod : p)).sort((a, b) => {
				const sd = b.start_date.localeCompare(a.start_date);
				if (sd !== 0) return sd;
				return b.end_date.localeCompare(a.end_date);
			}));

			const updatedPeriods = get(periodsAtom);
			const isLatest = updatedPeriods.length > 0 && updatedPeriods[0].id === realPeriod.id;

			if (isLatest) {
				// Opening a new period closes the previous one: snapshot its metrics
				// (same effect as the "Зафиксировать метрики" button). Done before the
				// WIP transfer so the closed period keeps its real WIP counts.
				if (previousLatest) {
					try {
						const stats = await import('@/atoms/statsAtom');
						const alreadyLocked = get(stats.periodStatisticsAtom).some(
							(s) => s.period_id === previousLatest.id,
						);
						if (!alreadyLocked) {
							await set(stats.lockPeriodMetricsAtom, previousLatest.id);
						}
					} catch (lockError) {
						console.error('Auto-lock of previous period failed after period creation:', lockError);
						// Non-fatal: the period was created; metrics can still be locked manually.
					}
				}

				try {
					const updatedTasks = await transferWipTasks(realPeriod.id);
					if (updatedTasks.length > 0) {
						const { tasksAtom } = await import('@/atoms/tasksAtom');
						const updatedMap = new Map(updatedTasks.map((t) => [t.id, t]));
						set(tasksAtom, get(tasksAtom).map((t) => updatedMap.get(t.id) ?? t));
					}
				} catch (transferError) {
					console.error('WIP transfer failed after period creation:', transferError);
					// Period was created successfully. Transfer failure is non-fatal per TS §4.2 assumption 9.
					// The error is logged; the user sees the period but WIP tasks are not yet reassigned.
				}
			}
		} catch (error) {
			set(periodsAtom, get(periodsAtom).filter((p) => p.id !== tempId));
			throw error;
		}
	},
);

export const deletePeriodAtom = atom(
	null,
	async (get, set, id: string) => {
		const previousPeriods = get(periodsAtom);
		const { tasksAtom } = await import('@/atoms/tasksAtom');
		const previousTasks = get(tasksAtom);

		// Optimistic: remove period from UI immediately
		set(periodsAtom, previousPeriods.filter((p) => p.id !== id));

		try {
			// Step 1: reset active_period_id for cross-period tasks BEFORE deletion
			const resetTasks = await resetActivePeriodForDeletion(id);

			// Step 2: update tasksAtom — apply resets and remove cascade-deleted tasks
			const resetMap = new Map(resetTasks.map((t) => [t.id, t]));
			set(
				tasksAtom,
				previousTasks
					.filter((t) => t.creation_period_id !== id)
					.map((t) => resetMap.get(t.id) ?? t),
			);

			// Step 3: delete the period (cascade-deletes tasks with creation_period_id = id in DB)
			await deletePeriod(id);
		} catch (error) {
			// Rollback both atoms
			set(periodsAtom, previousPeriods);
			set(tasksAtom, previousTasks);
			throw error;
		}
	},
);
