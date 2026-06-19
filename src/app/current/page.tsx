'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentTasksAtom, returnToQAAtom } from '@/atoms/tasksAtom';
import { periodsAtom } from '@/atoms/periodsAtom';
import { CurrentTasksTable } from '@/components/current/CurrentTasksTable';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { CompleteTaskModal } from '@/components/modals/CompleteTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CommentModal } from '@/components/modals/CommentModal';
import { SearchInput } from '@/components/shared/SearchInput';
import { matchesQuery } from '@/lib/utils';
import type { Task } from '@/types';

export default function CurrentPage() {
	const tasks = useAtomValue(currentTasksAtom);
	const periods = useAtomValue(periodsAtom);
	const returnToQA = useSetAtom(returnToQAAtom);

	const [query, setQuery] = React.useState('');
	const filteredTasks = React.useMemo(
		() => tasks.filter((t) => matchesQuery(query, t.title, t.assignee)),
		[tasks, query],
	);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [completingTask, setCompletingTask] = React.useState<Task | null>(null);
	const [returningTaskId, setReturningTaskId] = React.useState<string | null>(null);
	const [returnLoading, setReturnLoading] = React.useState(false);
	const [commentingTask, setCommentingTask] = React.useState<Task | null>(null);

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
		<div className="p-0 sm:p-6">
			<div className="mb-4 flex md:flex-row flex-col md:items-center gap-2">
				<h1 className="text-2xl font-semibold">Текущие задачи</h1>
				<div className="bg-muted/80 text-muted-foreground text-xs px-2.5 py-0.5 rounded-full md:w-auto w-fit">
					Всего: {tasks.length}{criticalCount !== undefined && criticalCount > 0 ? <>, Крит: <span className="text-red-500">{criticalCount}</span></> : ''}
				</div>
				<SearchInput onChange={setQuery} className="md:ml-auto" />
			</div>

			<CurrentTasksTable
				tasks={filteredTasks}
				periods={periods}
				onEdit={setEditingTask}
				onComplete={setCompletingTask}
				onReturnToQA={setReturningTaskId}
				onOpenComment={setCommentingTask}
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

			{commentingTask && (
				<CommentModal
					open={true}
					onClose={() => setCommentingTask(null)}
					task={commentingTask}
				/>
			)}
		</div>
	);
}
