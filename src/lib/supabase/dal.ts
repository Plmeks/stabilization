import { supabase } from './client';
import type {
	Period,
	Task,
	PeriodStatistics,
	CreatePeriodInput,
	CreateTaskInput,
	UpdateTaskInput,
	CompletionInput,
} from '@/types';

// Period functions

export async function fetchPeriods(): Promise<Period[]> {
	const { data, error } = await supabase
		.from('periods')
		.select('*')
		.order('start_date', { ascending: false })
		.order('end_date', { ascending: false });

	if (error) throw error;
	return data as Period[];
}

export async function createPeriod(input: CreatePeriodInput): Promise<Period> {
	const { data, error } = await supabase
		.from('periods')
		.insert(input)
		.select()
		.single();

	if (error) throw error;
	return data as Period;
}

export async function deletePeriod(id: string): Promise<void> {
	const { error } = await supabase
		.from('periods')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

// Task functions

export async function fetchTasks(): Promise<Task[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*');

	if (error) throw error;
	return data as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
	const payload = { ...input, active_period_id: input.creation_period_id };

	const { data, error } = await supabase
		.from('tasks')
		.insert(payload)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function takeIntoWork(
	id: string,
	latestPeriodId: string,
	assignee?: string | null,
): Promise<Task> {
	const { data: existing, error: fetchError } = await supabase
		.from('tasks')
		.select('priority')
		.eq('id', id)
		.single();

	if (fetchError) throw fetchError;

	const priority = existing.priority ?? 'Нормальный';

	const { data, error } = await supabase
		.from('tasks')
		.update({
			status: 'В работе',
			taken_into_work_at: new Date().toISOString(),
			priority,
			active_period_id: latestPeriodId,
			...(assignee !== undefined ? { assignee } : {}),
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
	const { data, error } = await supabase
		.from('tasks')
		.update(input)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function completeTask(id: string, input: CompletionInput): Promise<Task> {
	const { data, error } = await supabase
		.from('tasks')
		.update({
			status: 'Завершена',
			completed_at: new Date().toISOString(),
			active_period_id: input.active_period_id,
			version: input.version ?? null,
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function returnTaskToWork(id: string, input: UpdateTaskInput, latestPeriodId: string): Promise<Task> {
	const { data, error } = await supabase
		.from('tasks')
		.update({ completed_at: null, ...input, active_period_id: latestPeriodId })
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function returnTaskToQA(id: string): Promise<Task> {
	const { data: existing, error: fetchError } = await supabase
		.from('tasks')
		.select('creation_period_id')
		.eq('id', id)
		.single();

	if (fetchError) throw fetchError;

	const { data, error } = await supabase
		.from('tasks')
		.update({
			status: null,
			taken_into_work_at: null,
			completed_at: null,
			assignee: null,
			active_period_id: existing.creation_period_id,
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

export async function transferWipTasks(newPeriodId: string): Promise<Task[]> {
	const { data, error } = await supabase
		.from('tasks')
		.update({ active_period_id: newPeriodId })
		.in('status', ['В работе', 'В тесте', 'Блокер'])
		.select();

	if (error) throw error;
	return data as Task[];
}

export async function resetActivePeriodForDeletion(periodId: string): Promise<Task[]> {
	const { data: affected, error: fetchError } = await supabase
		.from('tasks')
		.select('*')
		.eq('active_period_id', periodId)
		.neq('creation_period_id', periodId);

	if (fetchError) throw fetchError;
	if (!affected || affected.length === 0) return [];

	const results = await Promise.all(
		(affected as Task[]).map(async (task) => {
			const { data, error } = await supabase
				.from('tasks')
				.update({ active_period_id: task.creation_period_id })
				.eq('id', task.id)
				.select()
				.single();

			if (error) throw error;
			return data as Task;
		}),
	);

	return results;
}

// PeriodStatistics functions

export async function fetchAllPeriodStatistics(): Promise<PeriodStatistics[]> {
	const { data, error } = await supabase
		.from('period_statistics')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data as PeriodStatistics[];
}

export async function createPeriodStatistics(
	periodId: string,
	metrics: Omit<PeriodStatistics, 'id' | 'period_id' | 'locked_at' | 'created_at'>,
): Promise<PeriodStatistics> {
	const { data, error } = await supabase
		.from('period_statistics')
		.insert({ period_id: periodId, ...metrics })
		.select()
		.single();

	if (error) throw error;
	return data as PeriodStatistics;
}

export async function updatePeriodStatistics(
	id: string,
	metrics: Omit<PeriodStatistics, 'id' | 'period_id' | 'locked_at' | 'created_at'>,
): Promise<PeriodStatistics> {
	const { data, error } = await supabase
		.from('period_statistics')
		.update(metrics)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as PeriodStatistics;
}

export async function updatePeriodStatisticsComment(
	id: string,
	comment: string | null,
): Promise<void> {
	const { error } = await supabase
		.from('period_statistics')
		.update({ comment })
		.eq('id', id);

	if (error) throw error;
}

export async function deletePeriodStatistics(periodId: string): Promise<void> {
	const { error } = await supabase
		.from('period_statistics')
		.delete()
		.eq('period_id', periodId);

	if (error) throw error;
}
