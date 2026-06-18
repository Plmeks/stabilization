'use client';

import * as React from 'react';
import {
	Table,
	TableHeader,
	TableBody,
	TableHead,
	TableRow,
} from '@/components/ui/table';
import { CompletedTasksRow } from './CompletedTasksRow';
import { SortableTableHead, useTableSort } from '@/components/shared/SortableTableHead';
import { sortTasksForTable, defaultCompletedComparator } from '@/lib/task-sort';
import type { Task, Period } from '@/types';

interface CompletedTasksTableProps {
	tasks: Task[];
	periods: Period[];
	onEdit: (task: Task) => void;
	onReturnToQA: (taskId: string) => void;
	onOpenComment: (task: Task) => void;
}

export function CompletedTasksTable({ tasks, periods, onEdit, onReturnToQA, onOpenComment }: CompletedTasksTableProps) {
	const { sort, toggleSort } = useTableSort();

	const periodMap = React.useMemo(
		() => new Map(periods.map((p) => [p.id, p])),
		[periods],
	);

	const sorted = React.useMemo(
		() => sortTasksForTable(tasks, sort, periodMap, defaultCompletedComparator),
		[tasks, sort, periodMap],
	);

	return (
		<Table className="min-w-[640px]">
			<TableHeader>
				<TableRow>
					<TableHead className="min-w-[17rem] px-2 md:px-4">Задача</TableHead>
					<SortableTableHead label="Исполнитель" column="assignee" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<SortableTableHead label="Приоритет" column="priority" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<SortableTableHead label="Создана в периоде" column="createdPeriod" sort={sort} onSort={toggleSort} className="px-2 md:px-4 w-[110px]" />
					<TableHead className="px-2 md:px-4">Статус</TableHead>
					<SortableTableHead label="Дата завершения" column="completedAt" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<SortableTableHead label="Версия" column="version" sort={sort} onSort={toggleSort} className="px-2 md:px-4" />
					<TableHead className="sticky right-0 bg-background z-10 px-2 md:px-4">Действия</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sorted.map((task) => (
					<CompletedTasksRow
						key={task.id}
						task={task}
						period={periodMap.get(task.active_period_id)}
						creationPeriod={periodMap.get(task.creation_period_id)}
						onEdit={() => onEdit(task)}
						onReturnToQA={() => onReturnToQA(task.id)}
						onOpenComment={() => onOpenComment(task)}
					/>
				))}
			</TableBody>
		</Table>
	);
}
