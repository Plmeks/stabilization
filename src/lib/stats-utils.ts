import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { Period, PeriodStatistics, Task } from '@/types';

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
	periodStatistics?: PeriodStatistics[],
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

	// Iterative accumulation: walk through all periods up to this one in order.
	// When a period has fixed statistics, reset running totals to those values.
	// When a period has no fixed stats, accumulate task-based deltas on top.
	let runningTotal = 0;
	let runningCompleted = 0;
	let runningUncompletedCritical = 0;
	let runningUncompletedNonCritical = 0;

	for (const p of periodsUpToThis) {
		const fixedStats = (periodStatistics ?? []).find((ps) => ps.period_id === p.id);

		if (fixedStats) {
			runningTotal = fixedStats.total_problems_cumulative;
			runningCompleted = fixedStats.completed_cumulative;
			runningUncompletedCritical = fixedStats.uncompleted_critical;
			runningUncompletedNonCritical = fixedStats.uncompleted_non_critical;
		} else {
			const periodCreatedTasks = allTasks.filter((t) => t.creation_period_id === p.id);
			const periodActiveTasks = allTasks.filter((t) => t.active_period_id === p.id);

			const deltaAdded = periodCreatedTasks.length;
			const deltaAddedCritical = periodCreatedTasks.filter((t) => t.priority === 'Критический').length;
			const deltaAddedNonCritical = periodCreatedTasks.filter((t) => t.priority !== 'Критический').length;

			const deltaResolved = periodActiveTasks.filter((t) => t.status === 'Завершена').length;
			const deltaResolvedCritical = periodActiveTasks.filter(
				(t) => t.status === 'Завершена' && t.priority === 'Критический',
			).length;
			const deltaResolvedNonCritical = periodActiveTasks.filter(
				(t) => t.status === 'Завершена' && t.priority !== 'Критический',
			).length;

			runningTotal += deltaAdded;
			runningCompleted += deltaResolved;
			runningUncompletedCritical += deltaAddedCritical - deltaResolvedCritical;
			runningUncompletedNonCritical += deltaAddedNonCritical - deltaResolvedNonCritical;
		}
	}

	const total_problems_cumulative = runningTotal;
	const completed_cumulative = runningCompleted;
	const uncompleted = total_problems_cumulative - completed_cumulative;
	const uncompleted_critical = runningUncompletedCritical;
	const uncompleted_non_critical = runningUncompletedNonCritical;

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
