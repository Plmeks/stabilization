import { atom } from 'jotai';
import type { Period } from '@/types';

export const expandedPeriodsAtom = atom<Set<string>>(new Set<string>());

export const togglePeriodExpansionAtom = atom(
	null,
	(get, set, id: string) => {
		const current = get(expandedPeriodsAtom);
		const next = new Set(current);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		set(expandedPeriodsAtom, next);
	},
);

export const initExpandedPeriodsAtom = atom(
	null,
	(_get, set, periods: Period[]) => {
		if (periods.length === 0) {
			set(expandedPeriodsAtom, new Set());
			return;
		}
		set(expandedPeriodsAtom, new Set([periods[0].id]));
	},
);
