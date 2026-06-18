import type { Task, Period } from '@/types';

export type SortDirection = 'primary' | 'reverse';
export type SortState = { column: string; direction: SortDirection } | null;

const PRIORITY_RANK: Record<string, number> = {
	'Критический': 0,
	'Нормальный': 1,
	'Некритичный': 2,
};

const priorityRank = (p: string | null): number =>
	p === null ? 3 : PRIORITY_RANK[p] ?? 3;

// Severity order for the current-tasks board: Блокер выше, затем Бэклог (null), В работе, В тесте.
const STATUS_RANK: Record<string, number> = {
	'Блокер': 0,
	'В работе': 2,
	'В тесте': 3,
	'Завершена': 4,
};

// Бэклог (status === null) встаёт между Блокером и «В работе».
const BACKLOG_RANK = 1;

const statusRank = (s: string | null): number =>
	s === null ? BACKLOG_RANK : STATUS_RANK[s] ?? 5;

const timeOf = (d: string | null | undefined): number => (d ? new Date(d).getTime() : 0);

// Stable final tie-breaker: newest created first.
const byCreatedDesc = (a: Task, b: Task): number =>
	timeOf(b.created_at) - timeOf(a.created_at);

// Empty text values always sort last (return value is direction-agnostic only for
// the empties rule via callers negating the whole comparator — acceptable tradeoff).
const compareText = (a: string | null, b: string | null): number => {
	const av = (a ?? '').trim();
	const bv = (b ?? '').trim();
	if (!av && !bv) return 0;
	if (!av) return 1;
	if (!bv) return -1;
	return av.localeCompare(bv, 'ru');
};

// Default order when no column is explicitly selected.
export const defaultCurrentComparator = (a: Task, b: Task): number => {
	const p = priorityRank(a.priority) - priorityRank(b.priority);
	if (p !== 0) return p;
	const s = statusRank(a.status) - statusRank(b.status);
	if (s !== 0) return s;
	return byCreatedDesc(a, b);
};

export const defaultCompletedComparator = (a: Task, b: Task): number => {
	const p = priorityRank(a.priority) - priorityRank(b.priority);
	if (p !== 0) return p;
	return timeOf(b.completed_at) - timeOf(a.completed_at);
};

// Primary (first-click) comparator for each sortable column.
function columnComparator(
	column: string,
	periodMap: Map<string, Period>,
): ((a: Task, b: Task) => number) | null {
	switch (column) {
		case 'assignee':
			return (a, b) => compareText(a.assignee, b.assignee);
		case 'priority':
			// critical first
			return (a, b) => priorityRank(a.priority) - priorityRank(b.priority);
		case 'createdPeriod':
			// newest creation period first
			return (a, b) =>
				timeOf(periodMap.get(b.creation_period_id)?.start_date) -
				timeOf(periodMap.get(a.creation_period_id)?.start_date);
		case 'status':
			// Блокер first
			return (a, b) => statusRank(a.status) - statusRank(b.status);
		case 'completedAt':
			// newest completed first
			return (a, b) => timeOf(b.completed_at) - timeOf(a.completed_at);
		case 'version':
			// newer version first (numeric-aware)
			return (a, b) => {
				const av = (a.version ?? '').trim();
				const bv = (b.version ?? '').trim();
				if (!av && !bv) return 0;
				if (!av) return 1;
				if (!bv) return -1;
				return bv.localeCompare(av, undefined, { numeric: true });
			};
		default:
			return null;
	}
}

export function sortTasksForTable(
	tasks: Task[],
	sort: SortState,
	periodMap: Map<string, Period>,
	defaultComparator: (a: Task, b: Task) => number,
): Task[] {
	if (!sort) {
		return [...tasks].sort(defaultComparator);
	}

	const base = columnComparator(sort.column, periodMap);
	if (!base) {
		return [...tasks].sort(defaultComparator);
	}

	const dir = sort.direction === 'reverse' ? -1 : 1;
	return [...tasks].sort((a, b) => {
		const r = base(a, b) * dir;
		if (r !== 0) return r;
		return byCreatedDesc(a, b);
	});
}
