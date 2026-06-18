import { atom } from 'jotai';
import type { Task, CreateTaskInput, UpdateTaskInput, CompletionInput } from '@/types';
import {
	fetchTasks,
	createTask,
	takeIntoWork,
	updateTask,
	completeTask,
	returnTaskToWork,
	deleteTask,
	returnTaskToQA,
} from '@/lib/supabase/dal';
import { isTaskActive, isTaskCompleted } from '@/lib/utils';
import { periodsAtom } from '@/atoms/periodsAtom';

export const tasksAtom = atom<Task[]>([]);

export const fetchTasksAtom = atom(
	null,
	async (_get, set) => {
		const tasks = await fetchTasks();
		set(tasksAtom, tasks);
	},
);

export const createTaskAtom = atom(
	null,
	async (get, set, input: CreateTaskInput) => {
		const tempId = `temp-${Date.now()}`;
		const tempTask: Task = {
			id: tempId,
			title: input.title,
			creation_period_id: input.creation_period_id,
			active_period_id: input.creation_period_id,
			assignee: null,
			priority: input.priority ?? null,
			status: null,
			created_at: new Date().toISOString(),
			taken_into_work_at: null,
			completed_at: null,
			link: input.link ?? null,
			version: null,
			comment: input.comment ?? null,
		};

		set(tasksAtom, [...get(tasksAtom), tempTask]);

		try {
			const realTask = await createTask(input);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === tempId ? realTask : t)));
		} catch (error) {
			set(tasksAtom, get(tasksAtom).filter((t) => t.id !== tempId));
			throw error;
		}
	},
);

export const takeIntoWorkAtom = atom(
	null,
	async (get, set, { id, assignee }: { id: string; assignee?: string | null }) => {
		const periods = get(periodsAtom);
		const latestPeriodId = periods[0]?.id ?? '';
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) =>
			t.id === id
				? {
					...t,
					status: 'В работе' as const,
					taken_into_work_at: new Date().toISOString(),
					priority: t.priority ?? 'Нормальный' as const,
					active_period_id: latestPeriodId,
					...(assignee !== undefined ? { assignee } : {}),
				}
				: t,
		));

		try {
			const updated = await takeIntoWork(id, latestPeriodId, assignee);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === id ? updated : t)));
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

export const updateTaskAtom = atom(
	null,
	async (get, set, { id, input }: { id: string; input: UpdateTaskInput }) => {
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) => (t.id === id ? { ...t, ...input } : t)));

		try {
			const updated = await updateTask(id, input);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === id ? updated : t)));
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

export const completeTaskAtom = atom(
	null,
	async (get, set, { id, input }: { id: string; input: CompletionInput }) => {
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) =>
			t.id === id
				? { ...t, status: 'Завершена' as const, completed_at: new Date().toISOString(), active_period_id: input.active_period_id, version: input.version ?? null }
				: t,
		));

		try {
			const updated = await completeTask(id, input);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === id ? updated : t)));
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

export const returnTaskToWorkAtom = atom(
	null,
	async (get, set, { id, input }: { id: string; input: UpdateTaskInput }) => {
		const periods = get(periodsAtom);
		const latestPeriodId = periods[0]?.id ?? '';
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) =>
			t.id === id
				? { ...t, completed_at: null, active_period_id: latestPeriodId, ...input }
				: t,
		));

		try {
			const updated = await returnTaskToWork(id, input, latestPeriodId);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === id ? updated : t)));
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

export const returnToQAAtom = atom(
	null,
	async (get, set, id: string) => {
		const previous = get(tasksAtom);
		const taskToReturn = previous.find((t) => t.id === id);
		set(tasksAtom, previous.map((t) =>
			t.id === id
				? {
					...t,
					status: null,
					taken_into_work_at: null,
					completed_at: null,
					assignee: null,
					active_period_id: taskToReturn?.creation_period_id ?? t.active_period_id,
				}
				: t,
		));

		try {
			const updated = await returnTaskToQA(id);
			set(tasksAtom, get(tasksAtom).map((t) => (t.id === id ? updated : t)));
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

export const deleteTaskAtom = atom(
	null,
	async (get, set, id: string) => {
		const previous = get(tasksAtom);
		set(tasksAtom, previous.filter((t) => t.id !== id));

		try {
			await deleteTask(id);
		} catch (error) {
			set(tasksAtom, previous);
			throw error;
		}
	},
);

// Derived read atoms

export const qaTasksAtom = atom((get) =>
	get(tasksAtom),
);

export const currentTasksAtom = atom((get) =>
	get(tasksAtom).filter((t) => isTaskActive(t)),
);

export const completedTasksAtom = atom((get) =>
	get(tasksAtom).filter((t) => isTaskCompleted(t)),
);

export const tasksByCreationPeriodAtom = atom((get) =>
	get(tasksAtom).reduce<Record<string, Task[]>>((acc, task) => {
		const key = task.creation_period_id;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(task);
		return acc;
	}, {}),
);

export const tasksByActivePeriodAtom = atom((get) =>
	get(tasksAtom).reduce<Record<string, Task[]>>((acc, task) => {
		const key = task.active_period_id;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(task);
		return acc;
	}, {}),
);
