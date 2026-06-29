'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { periodsAtom } from '@/atoms/periodsAtom';
import { completedTasksAtom, returnToQAAtom } from '@/atoms/tasksAtom';
import { Button } from '@/components/ui/button';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CommentModal } from '@/components/modals/CommentModal';
import { CompletedPeriodSection } from '@/components/completed/CompletedPeriodSection';
import { SearchInput } from '@/components/shared/SearchInput';
import { PageHeader } from '@/components/shared/PageHeader';
import { matchesQuery } from '@/lib/utils';
import type { Task } from '@/types';

export default function CompletedPage() {
	const periods = useAtomValue(periodsAtom);
	const completedTasks = useAtomValue(completedTasksAtom);
	const [expandedPeriods, setExpandedPeriods] = React.useState<Set<string>>(new Set());
	const expandedInitialized = React.useRef(false);
	const [isAllExpanded, setIsAllExpanded] = React.useState(true);
	const returnToQA = useSetAtom(returnToQAAtom);

	const [query, setQuery] = React.useState('');
	const isSearching = query.trim().length > 0;

	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [returningTaskId, setReturningTaskId] = React.useState<string | null>(null);
	const [returnLoading, setReturnLoading] = React.useState(false);
	const [commentingTask, setCommentingTask] = React.useState<Task | null>(null);

	const filteredTasks = React.useMemo(
		() => completedTasks.filter((t) => matchesQuery(query, t.title, t.assignee, t.version)),
		[completedTasks, query],
	);

	const completedTasksByPeriod = React.useMemo(() => {
		const map = new Map<string, Task[]>();
		for (const task of filteredTasks) {
			const existing = map.get(task.active_period_id) ?? [];
			map.set(task.active_period_id, [...existing, task]);
		}
		return map;
	}, [filteredTasks]);

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
		<div className="flex flex-col gap-4 p-0 sm:gap-5 sm:p-6">
			{completedTasks.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					Нет выполненных задач
				</p>
			) : (
				<>
					<PageHeader
						eyebrow="Завершено"
						title="Выполненные задачи"
						actions={
							<div className="flex w-full items-center gap-2 sm:w-auto">
								<SearchInput onChange={setQuery} className="flex-1 min-w-0 sm:w-64 sm:flex-none" />
								<Button variant="outline" size="sm" onClick={toggleAll} className="shrink-0 w-fit sm:w-[8rem]">
									{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
								</Button>
							</div>
						}
					/>
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
								isExpanded={isSearching ? true : expandedPeriods.has(period.id)}
								onToggle={() => togglePeriod(period.id)}
								onEdit={setEditingTask}
								onReturnToQA={setReturningTaskId}
								onOpenComment={setCommentingTask}
							/>
						))
					)}
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
