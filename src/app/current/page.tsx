'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentTasksAtom, deleteTaskAtom } from '@/atoms/tasksAtom';
import { periodsAtom } from '@/atoms/periodsAtom';
import { CurrentTasksTable } from '@/components/current/CurrentTasksTable';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { CompleteTaskModal } from '@/components/modals/CompleteTaskModal';
import { CommentModal } from '@/components/modals/CommentModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { PageHeader, CountChip } from '@/components/shared/PageHeader';
import { matchesQuery } from '@/lib/utils';
import type { Task } from '@/types';

export default function CurrentPage() {
	const tasks = useAtomValue(currentTasksAtom);
	const periods = useAtomValue(periodsAtom);
	const deleteTask = useSetAtom(deleteTaskAtom);

	const [query, setQuery] = React.useState('');
	const filteredTasks = React.useMemo(
		() => tasks.filter((t) => matchesQuery(query, t.title, t.assignee)),
		[tasks, query],
	);

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [completingTask, setCompletingTask] = React.useState<Task | null>(null);
	const [commentingTask, setCommentingTask] = React.useState<Task | null>(null);
	const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = React.useState<string | null>(null);

	const handleDeleteTaskConfirm = async () => {
		if (!showDeleteTaskConfirm) return;
		await deleteTask(showDeleteTaskConfirm);
		setShowDeleteTaskConfirm(null);
	};

	const criticalCount = tasks.filter((t) => t.priority === 'Критический').length;

	return (
		<div className="flex flex-col gap-4 p-0 sm:gap-5 sm:p-6">
			<PageHeader
				eyebrow="В работе"
				title="Текущие задачи"
				meta={<CountChip total={tasks.length} critical={criticalCount} />}
				actions={<SearchInput onChange={setQuery} />}
			/>

			<div className="panel overflow-hidden">
				<CurrentTasksTable
					tasks={filteredTasks}
					periods={periods}
					onEdit={setEditingTask}
					onComplete={setCompletingTask}
					onDelete={setShowDeleteTaskConfirm}
					onOpenComment={setCommentingTask}
				/>
			</div>

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

			{commentingTask && (
				<CommentModal
					open={true}
					onClose={() => setCommentingTask(null)}
					task={commentingTask}
				/>
			)}

			<ConfirmDialog
				open={showDeleteTaskConfirm !== null}
				onClose={() => setShowDeleteTaskConfirm(null)}
				onConfirm={handleDeleteTaskConfirm}
				title="Удалить задачу"
				message="Вы уверены, что хотите удалить эту задачу?"
			/>
		</div>
	);
}
