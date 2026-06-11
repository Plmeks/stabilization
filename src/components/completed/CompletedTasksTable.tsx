'use client';

import {
	Table,
	TableHeader,
	TableBody,
	TableHead,
	TableRow,
} from '@/components/ui/table';
import { CompletedTasksRow } from './CompletedTasksRow';
import type { Task, Period } from '@/types';

interface CompletedTasksTableProps {
	tasks: Task[];
	periods: Period[];
	onEdit: (task: Task) => void;
	onDelete: (taskId: string) => void;
	onReturnToQA: (taskId: string) => void;
}

export function CompletedTasksTable({ tasks, periods, onEdit, onDelete, onReturnToQA }: CompletedTasksTableProps) {
	const periodMap = new Map(periods.map((p) => [p.id, p]));

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="px-4">Задача</TableHead>
					<TableHead className="px-4">Исполнитель</TableHead>
					<TableHead className="px-4">Приоритет</TableHead>
					<TableHead className="px-4">Статус</TableHead>
					<TableHead className="hidden md:table-cell px-4">Период</TableHead>
					<TableHead className="hidden md:table-cell px-4">Дата завершения</TableHead>
					<TableHead className="px-4">Действия</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tasks.map((task) => (
					<CompletedTasksRow
						key={task.id}
						task={task}
						period={periodMap.get(task.period_id)}
						onEdit={() => onEdit(task)}
						onDelete={() => onDelete(task.id)}
						onReturnToQA={() => onReturnToQA(task.id)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
