'use client';

import * as React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { completedTasksAtom, deleteTaskAtom } from '@/atoms/tasksAtom';
import { expandedPeriodsAtom, togglePeriodExpansionAtom } from '@/atoms/uiAtom';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CompletedPeriodSection } from '@/components/completed/CompletedPeriodSection';
import type { Task } from '@/types';

export default function CompletedPage() {
	const periods = useAtomValue(periodsAtom);
	const completedTasks = useAtomValue(completedTasksAtom);
	const [expandedPeriods] = useAtom(expandedPeriodsAtom);
	const togglePeriod = useSetAtom(togglePeriodExpansionAtom);
	const deleteTask = useSetAtom(deleteTaskAtom);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = React.useState(false);

	const completedTasksByPeriod = React.useMemo(() => {
		const map = new Map<string, Task[]>();
		for (const task of completedTasks) {
			const existing = map.get(task.period_id) ?? [];
			map.set(task.period_id, [...existing, task]);
		}
		return map;
	}, [completedTasks]);

	const periodsWithTasks = React.useMemo(() =>
		periods
			.filter((p) => (completedTasksByPeriod.get(p.id)?.length ?? 0) > 0)
			.sort((a, b) => b.start_date.localeCompare(a.start_date)),
		[periods, completedTasksByPeriod],
	);

	const handleConfirmDelete = async () => {
		if (deletingTaskId === null) return;
		setDeleteLoading(true);
		try {
			await deleteTask(deletingTaskId);
			setDeletingTaskId(null);
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			{periodsWithTasks.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					Нет выполненных задач
				</p>
			) : (
				periodsWithTasks.map((period) => (
					<CompletedPeriodSection
						key={period.id}
						period={period}
						tasks={completedTasksByPeriod.get(period.id) ?? []}
						periods={periods}
						isExpanded={expandedPeriods.has(period.id)}
						onToggle={() => togglePeriod(period.id)}
						onEdit={setEditingTask}
						onDelete={setDeletingTaskId}
					/>
				))
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
				open={deletingTaskId !== null}
				onClose={() => setDeletingTaskId(null)}
				onConfirm={handleConfirmDelete}
				title="Удалить задачу"
				message="Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить."
				loading={deleteLoading}
			/>
		</div>
	);
}
