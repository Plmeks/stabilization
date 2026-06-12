'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { completedTasksAtom, returnToQAAtom } from '@/atoms/tasksAtom';
import { Button } from '@/components/ui/button';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CompletedPeriodSection } from '@/components/completed/CompletedPeriodSection';
import type { Task } from '@/types';

export default function CompletedPage() {
	const periods = useAtomValue(periodsAtom);
	const completedTasks = useAtomValue(completedTasksAtom);
	const [expandedPeriods, setExpandedPeriods] = React.useState<Set<string>>(new Set());
	const expandedInitialized = React.useRef(false);
	const [isAllExpanded, setIsAllExpanded] = React.useState(false);
	const returnToQA = useSetAtom(returnToQAAtom);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [returningTaskId, setReturningTaskId] = React.useState<string | null>(null);
	const [returnLoading, setReturnLoading] = React.useState(false);

	const completedTasksByPeriod = React.useMemo(() => {
		const map = new Map<string, Task[]>();
		for (const task of completedTasks) {
			const existing = map.get(task.active_period_id) ?? [];
			map.set(task.active_period_id, [...existing, task]);
		}
		return map;
	}, [completedTasks]);

	const periodsWithTasks = React.useMemo(() =>
		periods
			.filter((p) => (completedTasksByPeriod.get(p.id)?.length ?? 0) > 0)
			.sort((a, b) => b.start_date.localeCompare(a.start_date)),
		[periods, completedTasksByPeriod],
	);

	React.useEffect(() => {
		if (!expandedInitialized.current && periodsWithTasks.length > 0) {
			expandedInitialized.current = true;
			setExpandedPeriods(new Set([periodsWithTasks[0].id]));
		}
	}, [periodsWithTasks]);

	const togglePeriod = (id: string) => {
		setExpandedPeriods((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleAll = () => {
		if (isAllExpanded) {
			setExpandedPeriods(new Set());
			setIsAllExpanded(false);
		} else {
			setExpandedPeriods(new Set(periodsWithTasks.map((p) => p.id)));
			setIsAllExpanded(true);
		}
	};

	const handleConfirmReturn = async () => {
		if (returningTaskId === null) return;
		setReturnLoading(true);
		try {
			await returnToQA(returningTaskId);
			setReturningTaskId(null);
		} finally {
			setReturnLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-5 p-6">
			{periodsWithTasks.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					Нет выполненных задач
				</p>
			) : (
				<>
					<div className="flex justify-end">
						<Button variant="outline" size="sm" onClick={toggleAll}>
							{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
						</Button>
					</div>
					{periodsWithTasks.map((period) => (
						<CompletedPeriodSection
							key={period.id}
							period={period}
							tasks={completedTasksByPeriod.get(period.id) ?? []}
							periods={periods}
							isExpanded={expandedPeriods.has(period.id)}
							onToggle={() => togglePeriod(period.id)}
							onEdit={setEditingTask}
							onReturnToQA={setReturningTaskId}
						/>
					))}
				</>
			)}

			{editingTask !== null && (
				<EditTaskModal
					open={true}
					onClose={() => setEditingTask(null)}
					task={editingTask}
					context="completed"
				/>
			)}

			<ConfirmDialog
				open={returningTaskId !== null}
				onClose={() => setReturningTaskId(null)}
				onConfirm={handleConfirmReturn}
				title="Вернуть в список новых задач?"
				message="Задача будет возвращена в очередь QA. Статус и дата завершения будут сброшены."
				loading={returnLoading}
				confirmLabel="Вернуть"
			/>
		</div>
	);
}
