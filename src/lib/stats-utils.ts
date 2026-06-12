import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { Period, Task } from '@/types';

dayjs.extend(isSameOrBefore);

export type DynamicMetrics = {
	added_to_backlog: number;
	added_critical: number;
	added_non_critical: number;
	resolved_total: number;
	resolved_critical: number;
	resolved_non_critical: number;
	in_progress: number;
	in_testing: number;
	in_block: number;
	wip_total: number;
	total_problems_cumulative: number;
	completed_cumulative: number;
	uncompleted: number;
	uncompleted_critical: number;
	uncompleted_non_critical: number;
};

export function calculateDynamicMetrics(
	period: Period,
	allPeriods: Period[],
	allTasks: Task[],
): DynamicMetrics {
	const periodTasks = allTasks.filter((t) => t.period_id === period.id);

	const added_to_backlog = periodTasks.length;
	const added_critical = periodTasks.filter((t) => t.priority === 'Авария').length;
	const added_non_critical = periodTasks.filter((t) => t.priority !== 'Авария').length;

	const resolved_total = periodTasks.filter((t) => t.status === 'Завершена').length;
	const resolved_critical = periodTasks.filter(
		(t) => t.status === 'Завершена' && t.priority === 'Авария',
	).length;
	const resolved_non_critical = periodTasks.filter(
		(t) => t.status === 'Завершена' && t.priority !== 'Авария',
	).length;

	const in_progress = periodTasks.filter((t) => t.status === 'В работе').length;
	const in_testing = periodTasks.filter((t) => t.status === 'В тесте').length;
	const in_block = periodTasks.filter((t) => t.status === 'Блокер').length;
	const wip_total = in_progress + in_testing;

	const sortedPeriods = [...allPeriods].sort((a, b) =>
		dayjs(a.start_date).diff(dayjs(b.start_date)),
	);

	const periodsUpToThis = sortedPeriods.filter((p) =>
		dayjs(p.start_date).isSameOrBefore(dayjs(period.start_date), 'day'),
	);

	const tasksUpToThis = allTasks.filter((t) =>
		periodsUpToThis.some((p) => p.id === t.period_id),
	);

	const total_problems_cumulative = tasksUpToThis.length;
	const completed_cumulative = tasksUpToThis.filter((t) => t.status === 'Завершена').length;
	const uncompleted = total_problems_cumulative - completed_cumulative;
	const uncompleted_critical = tasksUpToThis.filter(
		(t) => t.status !== 'Завершена' && t.priority === 'Авария',
	).length;
	const uncompleted_non_critical = tasksUpToThis.filter(
		(t) => t.status !== 'Завершена' && t.priority !== 'Авария',
	).length;

	return {
		added_to_backlog,
		added_critical,
		added_non_critical,
		resolved_total,
		resolved_critical,
		resolved_non_critical,
		in_progress,
		in_testing,
		in_block,
		wip_total,
		total_problems_cumulative,
		completed_cumulative,
		uncompleted,
		uncompleted_critical,
		uncompleted_non_critical,
	};
}
