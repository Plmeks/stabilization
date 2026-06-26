import { atom } from 'jotai';
import type { Assignee } from '@/types';
import {
	fetchAssignees,
	createAssignee,
	deleteAssignee,
} from '@/lib/supabase/dal';

export const assigneesAtom = atom<Assignee[]>([]);

export const fetchAssigneesAtom = atom(
	null,
	async (_get, set) => {
		try {
			const assignees = await fetchAssignees();
			set(assigneesAtom, assignees);
		} catch {
			// Таблица может ещё не существовать (миграция не применена) — не роняем приложение.
			set(assigneesAtom, []);
		}
	},
);

export const createAssigneeAtom = atom(
	null,
	async (get, set, name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		// Уже есть (без учёта регистра) — ничего не делаем.
		if (get(assigneesAtom).some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
			return;
		}

		const tempId = `temp-${Date.now()}`;
		const previous = get(assigneesAtom);
		const optimistic: Assignee = { id: tempId, name: trimmed, created_at: new Date().toISOString() };
		set(assigneesAtom, [...previous, optimistic].sort((a, b) => a.name.localeCompare(b.name)));

		try {
			const created = await createAssignee(trimmed);
			set(assigneesAtom, get(assigneesAtom).map((a) => (a.id === tempId ? created : a)));
		} catch {
			set(assigneesAtom, previous);
		}
	},
);

export const deleteAssigneeAtom = atom(
	null,
	async (get, set, id: string) => {
		const previous = get(assigneesAtom);
		set(assigneesAtom, previous.filter((a) => a.id !== id));
		try {
			await deleteAssignee(id);
		} catch {
			set(assigneesAtom, previous);
		}
	},
);
