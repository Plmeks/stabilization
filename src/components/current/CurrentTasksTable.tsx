import * as React from 'react';
import {
	Table,
	TableHeader,
	TableHead,
	TableBody,
	TableRow,
} from '@/components/ui/table';
import { CurrentTasksRow } from './CurrentTasksRow';
import { SortableTableHead, useTableSort } from '@/components/shared/SortableTableHead';
import { sortTasksForTable, defaultCurrentComparator } from '@/lib/task-sort';
import type { Task, Period } from '@/types';

interface CurrentTasksTableProps {
	tasks: Task[];
	periods: Period[];
	onEdit: (task: Task) => void;
	onComplete: (task: Task) => void;
	onDelete: (taskId: string) => void;
	onOpenComment: (task: Task) => void;
}

export function CurrentTasksTable({ tasks, periods, onEdit, onComplete, onDelete, onOpenComment }: CurrentTasksTableProps) {
	const { sort, toggleSort } = useTableSort();

	const periodMap = React.useMemo(
		() => new Map(periods.map((p) => [p.id, p])),
		[periods],
	);

	const sorted = React.useMemo(
		() => sortTasksForTable(tasks, sort, periodMap, defaultCurrentComparator),
		[tasks, sort, periodMap],
	);

	const getPeriod = (periodId: string): Period | undefined => periodMap.get(periodId);

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
				<TableRow>
					<TableHead className="min-w-[17rem] px-2 md:px-4">Задача</TableHead>
					<SortableTableHead label="Исполнитель" column="assignee" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<SortableTableHead label="Приоритет" column="priority" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<SortableTableHead label="Создана в периоде" column="createdPeriod" sort={sort} onSort={toggleSort} className="px-2 md:px-4 w-[110px]" />
					<SortableTableHead label="Статус" column="status" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<TableHead className="sticky right-0 bg-muted z-10 px-2 md:px-4">Действия</TableHead>
				</TableRow>
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
						onDelete={() => onDelete(task.id)}
						onOpenComment={() => onOpenComment(task)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
