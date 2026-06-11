import { atom } from 'jotai';
import type { Period, CreatePeriodInput } from '@/types';
import {
	fetchPeriods,
	createPeriod,
	deletePeriod,
} from '@/lib/supabase/dal';

export const periodsAtom = atom<Period[]>([]);

export const periodsLoadingAtom = atom<boolean>(false);

export const fetchPeriodsAtom = atom(
	null,
	async (_get, set) => {
		set(periodsLoadingAtom, true);
		try {
			const periods = await fetchPeriods();
			set(periodsAtom, periods);
		} finally {
			set(periodsLoadingAtom, false);
		}
	},
);

export const createPeriodAtom = atom(
	null,
	async (get, set, input: CreatePeriodInput) => {
		const tempId = `temp-${Date.now()}`;
		const tempPeriod: Period = {
			id: tempId,
			start_date: input.start_date,
			end_date: input.end_date,
			metrics_snapshot: null,
			metrics_locked_at: null,
			created_at: new Date().toISOString(),
		};

		set(periodsAtom, [tempPeriod, ...get(periodsAtom)]);

		try {
			const realPeriod = await createPeriod(input);
			set(periodsAtom, get(periodsAtom).map((p) => (p.id === tempId ? realPeriod : p)));
		} catch (error) {
			set(periodsAtom, get(periodsAtom).filter((p) => p.id !== tempId));
			throw error;
		}
	},
);

export const deletePeriodAtom = atom(
	null,
	async (get, set, id: string) => {
		const previous = get(periodsAtom);
		set(periodsAtom, previous.filter((p) => p.id !== id));

		try {
			await deletePeriod(id);
		} catch (error) {
			set(periodsAtom, previous);
			throw error;
		}
	},
);
