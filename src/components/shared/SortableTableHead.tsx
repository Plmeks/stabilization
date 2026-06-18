'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortState } from '@/lib/task-sort';

// One column sorted at a time. Click cycles: primary → reverse → default (cleared).
export function useTableSort() {
	const [sort, setSort] = React.useState<SortState>(null);

	const toggleSort = React.useCallback((column: string) => {
		setSort((prev) => {
			if (!prev || prev.column !== column) {
				return { column, direction: 'primary' };
			}
			if (prev.direction === 'primary') {
				return { column, direction: 'reverse' };
			}
			return null;
		});
	}, []);

	return { sort, toggleSort };
}

interface SortableTableHeadProps {
	label: string;
	column: string;
	sort: SortState;
	onSort: (column: string) => void;
	className?: string;
}

export function SortableTableHead({ label, column, sort, onSort, className }: SortableTableHeadProps) {
	const active = sort?.column === column;
	const Icon = !active ? ArrowUpDown : sort?.direction === 'primary' ? ArrowDown : ArrowUp;

	return (
		<TableHead className={className}>
			<button
				type="button"
				onClick={() => onSort(column)}
				className={cn(
					'inline-flex items-center gap-1 select-none cursor-pointer hover:text-foreground',
					active ? 'text-foreground' : 'text-muted-foreground',
				)}
			>
				{label}
				<Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'opacity-100' : 'opacity-40')} />
			</button>
		</TableHead>
	);
}
