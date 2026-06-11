'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentTasksAtom, returnToQAAtom } from '@/atoms/tasksAtom';
import { periodsAtom } from '@/atoms/periodsAtom';
import { CurrentTasksTable } from '@/components/current/CurrentTasksTable';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';

export default function CurrentPage() {
	const tasks = useAtomValue(currentTasksAtom);
	const periods = useAtomValue(periodsAtom);
	const returnToQA = useSetAtom(returnToQAAtom);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
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

	return (
		<div className="p-6">
			<div className="mb-4 flex items-center gap-2">
				<h1 className="text-xl font-semibold">Текущие задачи</h1>
				<Badge variant="secondary">{tasks.length}</Badge>
			</div>

			<CurrentTasksTable
				tasks={tasks}
				periods={periods}
				onEdit={setEditingTask}
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

			<ConfirmDialog
				open={returningTaskId !== null}
				onClose={() => setReturningTaskId(null)}
				onConfirm={handleReturnConfirm}
				title="Вернуть в QA"
				message="Задача будет возвращена в очередь QA. Исполнитель и статус будут сброшены."
				loading={returnLoading}
			/>
		</div>
	);
}
