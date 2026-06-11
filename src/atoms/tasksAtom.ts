import { atom } from 'jotai';
import type { Task, CreateTaskInput, TakeIntoWorkInput, UpdateTaskInput, CompletionInput, MetricsSnapshot } from '@/types';
import {
	fetchTasks,
	createTask,
	takeIntoWork,
	updateTask,
	completeTask,
	returnTaskToWork,
	deleteTask,
	lockMetrics,
} from '@/lib/supabase/dal';
import { isTaskActive, isTaskCompleted } from '@/lib/utils';
import { periodsAtom } from './periodsAtom';

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
			period_id: input.period_id,
			assignee: null,
			priority: null,
			status: 'Бэклог',
			created_at: new Date().toISOString(),
			taken_into_work_at: null,
			completed_at: null,
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
	async (get, set, { id, input }: { id: string; input: TakeIntoWorkInput }) => {
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) => (t.id === id ? { ...t, ...input } : t)));

		try {
			const updated = await takeIntoWork(id, input);
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
				? { ...t, status: 'Завершена' as const, completed_at: new Date().toISOString(), period_id: input.period_id }
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
		const previous = get(tasksAtom);
		set(tasksAtom, previous.map((t) =>
			t.id === id
				? { ...t, completed_at: null, ...input }
				: t,
		));

		try {
			const updated = await returnTaskToWork(id, input);
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

export const lockMetricsAtom = atom(
	null,
	async (get, set, periodId: string) => {
		const tasks = get(tasksAtom);
		const snapshot: MetricsSnapshot = {
			in_progress: tasks.filter((t) => isTaskActive(t) && t.status === 'В работе').length,
			in_testing: tasks.filter((t) => isTaskActive(t) && t.status === 'В тесте').length,
		};

		const updatedPeriod = await lockMetrics(periodId, snapshot);
		set(periodsAtom, get(periodsAtom).map((p) => (p.id === periodId ? updatedPeriod : p)));
	},
);

// Derived read atoms

export const qaTasksAtom = atom((get) =>
	get(tasksAtom).filter((t) => t.status !== 'Завершена'),
);

export const currentTasksAtom = atom((get) =>
	get(tasksAtom).filter((t) => isTaskActive(t)),
);

export const completedTasksAtom = atom((get) =>
	get(tasksAtom).filter((t) => isTaskCompleted(t)),
);

export const tasksByPeriodAtom = atom((get) =>
	get(tasksAtom).reduce<Record<string, Task[]>>((acc, task) => {
		const key = task.period_id;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(task);
		return acc;
	}, {}),
);
