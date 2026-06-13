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
	'Критический': 0,
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
	onComplete: (task: Task) => void;
	onReturnToQA: (taskId: string) => void;
	onOpenComment: (task: Task) => void;
}

export function CurrentTasksTable({ tasks, periods, onEdit, onComplete, onReturnToQA, onOpenComment }: CurrentTasksTableProps) {
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
		<Table className="min-w-[640px]">
			<TableHeader>
				<tr>
					<TableHead className="w-1/3 px-4">Задача</TableHead>
					<TableHead className="px-4">Исполнитель</TableHead>
					<TableHead className="px-4">Приоритет</TableHead>
					<TableHead className="px-4 w-[110px]">Создана в периоде</TableHead>
					<TableHead className="px-4">Статус</TableHead>
					<TableHead className="hidden md:table-cell px-4">Дата взятия</TableHead>
					<TableHead className="sticky right-0 bg-background z-10 px-4">Действия</TableHead>
				</tr>
			</TableHeader>
			<TableBody>
				{sorted.map((task) => (
					<CurrentTasksRow
						key={task.id}
						task={task}
						period={getPeriod(task.creation_period_id)}
						creationPeriod={getPeriod(task.creation_period_id)}
						onEdit={() => onEdit(task)}
						onComplete={() => onComplete(task)}
						onReturnToQA={() => onReturnToQA(task.id)}
						onOpenComment={() => onOpenComment(task)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
