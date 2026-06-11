import * as React from 'react';
import {
	Table,
	TableHeader,
	TableHead,
	TableBody,
} from '@/components/ui/table';
import { CurrentTasksRow } from './CurrentTasksRow';
import type { Task, Period } from '@/types';

const PRIORITY_ORDER: Record<string, number> = {
	'Авария': 0,
	'Нормальный': 1,
	'Некритичный': 2,
};

function getPriorityOrder(priority: string | null): number {
	if (priority === null) {
		return 3;
	}
	return PRIORITY_ORDER[priority] ?? 3;
}

function sortTasks(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => {
		const priorityDiff = getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
		if (priorityDiff !== 0) {
			return priorityDiff;
		}
		const aDate = a.taken_into_work_at ?? '';
		const bDate = b.taken_into_work_at ?? '';
		return aDate.localeCompare(bDate);
	});
}

interface CurrentTasksTableProps {
	tasks: Task[];
	periods: Period[];
	onEdit: (task: Task) => void;
	onDelete: (taskId: string) => void;
}

export function CurrentTasksTable({ tasks, periods, onEdit, onDelete }: CurrentTasksTableProps) {
	const sorted = sortTasks(tasks);

	const getPeriod = (periodId: string): Period | undefined =>
		periods.find((p) => p.id === periodId);

	if (sorted.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				Нет активных задач
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<tr>
					<TableHead>Задача</TableHead>
					<TableHead>Исполнитель</TableHead>
					<TableHead>Приоритет</TableHead>
					<TableHead>Статус</TableHead>
					<TableHead className="hidden md:table-cell">Период</TableHead>
					<TableHead className="hidden md:table-cell">Дата взятия</TableHead>
					<TableHead>Действия</TableHead>
				</tr>
			</TableHeader>
			<TableBody>
				{sorted.map((task) => (
					<CurrentTasksRow
						key={task.id}
						task={task}
						period={getPeriod(task.period_id)}
						onEdit={() => onEdit(task)}
						onDelete={() => onDelete(task.id)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
