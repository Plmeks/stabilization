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
	onReturnToQA: (taskId: string) => void;
}

export function CompletedTasksTable({ tasks, periods, onEdit, onReturnToQA }: CompletedTasksTableProps) {
	const periodMap = new Map(periods.map((p) => [p.id, p]));

	return (
		<Table className="min-w-[640px]">
			<TableHeader>
				<TableRow>
					<TableHead className="w-1/3 px-4">Задача</TableHead>
					<TableHead className="px-4">Исполнитель</TableHead>
					<TableHead className="px-4">Приоритет</TableHead>
					<TableHead className="px-4">Статус</TableHead>
					<TableHead className="hidden md:table-cell px-4">Дата завершения</TableHead>
					<TableHead className="sticky right-0 bg-background z-10 px-4">Действия</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tasks.map((task) => (
					<CompletedTasksRow
						key={task.id}
						task={task}
						period={periodMap.get(task.period_id)}
						onEdit={() => onEdit(task)}
						onReturnToQA={() => onReturnToQA(task.id)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
