import { supabase } from './client';
import type {
	Period,
	Task,
	CreatePeriodInput,
	CreateTaskInput,
	TakeIntoWorkInput,
	UpdateTaskInput,
	CompletionInput,
	MetricsSnapshot,
} from '@/types';

// Period functions

export async function fetchPeriods(): Promise<Period[]> {
	const { data, error } = await supabase
		.from('periods')
		.select('*')
		.order('start_date', { ascending: false });

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
	const { data, error } = await supabase
		.from('tasks')
		.insert({ ...input, status: 'Бэклог' })
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function takeIntoWork(id: string, input: TakeIntoWorkInput): Promise<Task> {
	const { data, error } = await supabase
		.from('tasks')
		.update({ taken_into_work_at: new Date().toISOString(), ...input })
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
			period_id: input.period_id,
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Task;
}

export async function returnTaskToWork(id: string, input: UpdateTaskInput): Promise<Task> {
	const { data, error } = await supabase
		.from('tasks')
		.update({ completed_at: null, ...input })
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

// Stats function

export async function lockMetrics(periodId: string, snapshot: MetricsSnapshot): Promise<Period> {
	const { data, error } = await supabase
		.from('periods')
		.update({
			metrics_snapshot: snapshot,
			metrics_locked_at: new Date().toISOString(),
		})
		.eq('id', periodId)
		.select()
		.single();

	if (error) throw error;
	return data as Period;
}
