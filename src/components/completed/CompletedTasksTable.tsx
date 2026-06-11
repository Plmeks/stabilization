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
}

export function CompletedTasksTable({ tasks, periods, onEdit, onDelete }: CompletedTasksTableProps) {
	const periodMap = new Map(periods.map((p) => [p.id, p]));

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Задача</TableHead>
					<TableHead>Исполнитель</TableHead>
					<TableHead>Приоритет</TableHead>
					<TableHead>Статус</TableHead>
					<TableHead className="hidden md:table-cell">Период</TableHead>
					<TableHead className="hidden md:table-cell">Дата завершения</TableHead>
					<TableHead>Действия</TableHead>
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
					/>
				))}
			</TableBody>
		</Table>
	);
}
