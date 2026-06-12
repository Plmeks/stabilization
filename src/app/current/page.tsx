'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentTasksAtom, returnToQAAtom } from '@/atoms/tasksAtom';
import { periodsAtom } from '@/atoms/periodsAtom';
import { CurrentTasksTable } from '@/components/current/CurrentTasksTable';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { CompleteTaskModal } from '@/components/modals/CompleteTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Task } from '@/types';

export default function CurrentPage() {
	const tasks = useAtomValue(currentTasksAtom);
	const periods = useAtomValue(periodsAtom);
	const returnToQA = useSetAtom(returnToQAAtom);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [completingTask, setCompletingTask] = React.useState<Task | null>(null);
	const [returningTaskId, setReturningTaskId] = React.useState<string | null>(null);
	const [returnLoading, setReturnLoading] = React.useState(false);

	const handleReturnConfirm = async () => {
		if (!returningTaskId) {
			return;
		}
		setReturnLoading(true);
		try {
			await returnToQA(returningTaskId);
			setReturningTaskId(null);
		} finally {
			setReturnLoading(false);
		}
	};

	const criticalCount = tasks.filter((t) => t.priority === 'Критический').length;

	return (
		<div className="p-6">
			<div className="mb-4 flex items-center gap-2">
				<h1 className="text-xl font-semibold">Текущие задачи</h1>
				<div className="bg-muted/80 text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
					Всего: {tasks.length}{criticalCount !== undefined && criticalCount > 0 ? <>, Крит: <span className="text-red-500">{criticalCount}</span></> : ''}
				</div>
			</div>

			<CurrentTasksTable
				tasks={tasks}
				periods={periods}
				onEdit={setEditingTask}
				onComplete={setCompletingTask}
				onReturnToQA={setReturningTaskId}
			/>

			{editingTask && (
				<EditTaskModal
					open={true}
					onClose={() => setEditingTask(null)}
					task={editingTask}
					context="current"
				/>
			)}

			{completingTask !== null && (
				<CompleteTaskModal
					open={true}
					onClose={() => setCompletingTask(null)}
					onCancel={() => setCompletingTask(null)}
					taskId={completingTask.id}
				/>
			)}

			<ConfirmDialog
				open={returningTaskId !== null}
				onClose={() => setReturningTaskId(null)}
				onConfirm={handleReturnConfirm}
				title="Вернуть в список новых задач?"
				message="Задача будет возвращена в очередь QA. Исполнитель и статус будут сброшены."
				loading={returnLoading}
				confirmLabel="Вернуть"
			/>
		</div>
	);
}
