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
	const creationPeriodTasks = allTasks.filter((t) => t.creation_period_id === period.id);
	const activePeriodTasks = allTasks.filter((t) => t.active_period_id === period.id);

	const added_to_backlog = creationPeriodTasks.length;
	const added_critical = creationPeriodTasks.filter((t) => t.priority === 'Критический').length;
	const added_non_critical = creationPeriodTasks.filter((t) => t.priority !== 'Критический').length;

	const resolved_total = activePeriodTasks.filter((t) => t.status === 'Завершена').length;
	const resolved_critical = activePeriodTasks.filter(
		(t) => t.status === 'Завершена' && t.priority === 'Критический',
	).length;
	const resolved_non_critical = activePeriodTasks.filter(
		(t) => t.status === 'Завершена' && t.priority !== 'Критический',
	).length;

	const in_progress = activePeriodTasks.filter((t) => t.status === 'В работе').length;
	const in_testing = activePeriodTasks.filter((t) => t.status === 'В тесте').length;
	const in_block = activePeriodTasks.filter((t) => t.status === 'Блокер').length;
	const wip_total = in_progress + in_testing;

	const sortedPeriods = [...allPeriods].sort((a, b) =>
		dayjs(a.start_date).diff(dayjs(b.start_date)),
	);

	const periodsUpToThis = sortedPeriods.filter((p) =>
		dayjs(p.start_date).isSameOrBefore(dayjs(period.start_date), 'day'),
	);

	const tasksUpToThis = allTasks.filter((t) =>
		periodsUpToThis.some((p) => p.id === t.creation_period_id),
	);

	const total_problems_cumulative = tasksUpToThis.length;
	const completed_cumulative = tasksUpToThis.filter((t) => t.status === 'Завершена').length;
	const uncompleted = total_problems_cumulative - completed_cumulative;
	const uncompleted_critical = tasksUpToThis.filter(
		(t) => t.status !== 'Завершена' && t.priority === 'Критический',
	).length;
	const uncompleted_non_critical = tasksUpToThis.filter(
		(t) => t.status !== 'Завершена' && t.priority !== 'Критический',
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
