'use client';

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAtomValue } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { tasksAtom } from '@/atoms/tasksAtom';
import StatsPeriodCard from '@/components/stats/StatsPeriodCard';

dayjs.extend(isBetween);

export default function StatsPage() {
	const periods = useAtomValue(periodsAtom);
	const tasks = useAtomValue(tasksAtom);

	const sortedPeriods = [...periods].sort((a, b) =>
		dayjs(b.start_date).diff(dayjs(a.start_date)),
	);

	return (
		<div className="p-4 space-y-4">
			{sortedPeriods.map((period) => {
				const addedToBacklog = tasks.filter((t) =>
					dayjs(t.created_at).isBetween(period.start_date, period.end_date, 'day', '[]'),
				).length;

				const addedCritical = tasks.filter((t) =>
					t.priority === 'Авария' &&
					dayjs(t.created_at).isBetween(period.start_date, period.end_date, 'day', '[]'),
				).length;

				const resolvedTotal = tasks.filter((t) =>
					t.completed_at !== null &&
					dayjs(t.completed_at).isBetween(period.start_date, period.end_date, 'day', '[]'),
				).length;

				const resolvedCritical = tasks.filter((t) =>
					t.completed_at !== null &&
					t.priority === 'Авария' &&
					dayjs(t.completed_at).isBetween(period.start_date, period.end_date, 'day', '[]'),
				).length;

				return (
					<StatsPeriodCard
						key={period.id}
						period={period}
						addedToBacklog={addedToBacklog}
						addedCritical={addedCritical}
						resolvedTotal={resolvedTotal}
						resolvedCritical={resolvedCritical}
					/>
				);
			})}
		</div>
	);
}
