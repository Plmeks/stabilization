'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QAPeriodSection } from '@/components/qa/QAPeriodSection';
import { CreatePeriodModal } from '@/components/modals/CreatePeriodModal';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { TakeIntoWorkModal } from '@/components/modals/TakeIntoWorkModal';
import { CommentModal } from '@/components/modals/CommentModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { PageHeader } from '@/components/shared/PageHeader';
import { matchesQuery } from '@/lib/utils';
import { periodsAtom } from '@/atoms/periodsAtom';
import { deletePeriodAtom } from '@/atoms/periodsAtom';
import { qaTasksAtom, tasksByCreationPeriodAtom, tasksByActivePeriodAtom, deleteTaskAtom } from '@/atoms/tasksAtom';
import { expandedPeriodsAtom, togglePeriodExpansionAtom } from '@/atoms/uiAtom';
import type { Task } from '@/types';

export default function QAPage() {
	const periods = useAtomValue(periodsAtom);
	const qaTasks = useAtomValue(qaTasksAtom);
	const tasksByCreationPeriod = useAtomValue(tasksByCreationPeriodAtom);
	const tasksByActivePeriod = useAtomValue(tasksByActivePeriodAtom);
	const [expandedPeriods, setExpandedPeriods] = useAtom(expandedPeriodsAtom);
	const toggleExpansion = useSetAtom(togglePeriodExpansionAtom);
	const deletePeriod = useSetAtom(deletePeriodAtom);
	const deleteTask = useSetAtom(deleteTaskAtom);

	const [isAllExpanded, setIsAllExpanded] = React.useState(true);
	const expandedInitialized = React.useRef(false);

	const [query, setQuery] = React.useState('');
	const isSearching = query.trim().length > 0;

	// Tasks matching the search, grouped by their creation period.
	const matchedTasksByPeriod = React.useMemo(() => {
		const map = new Map<string, Task[]>();
		for (const task of qaTasks) {
			if (!matchesQuery(query, task.title)) continue;
			const existing = map.get(task.creation_period_id) ?? [];
			existing.push(task);
			map.set(task.creation_period_id, existing);
		}
		return map;
	}, [qaTasks, query]);

	// While searching, only keep periods that have at least one match.
	const visiblePeriods = isSearching
		? periods.filter((p) => (matchedTasksByPeriod.get(p.id)?.length ?? 0) > 0)
		: periods;

	const [showCreatePeriodModal, setShowCreatePeriodModal] = React.useState(false);
	const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
	const [addTaskDefaultPeriodId, setAddTaskDefaultPeriodId] = React.useState<string | null>(null);
	const [showDeletePeriodConfirm, setShowDeletePeriodConfirm] = React.useState<string | null>(null);
	const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = React.useState<string | null>(null);
	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
	const [takingTask, setTakingTask] = React.useState<Task | null>(null);
	const [commentingTask, setCommentingTask] = React.useState<Task | null>(null);

	React.useEffect(() => {
		if (!expandedInitialized.current && periods.length > 0) {
			expandedInitialized.current = true;
			setExpandedPeriods(new Set([periods[0].id]));
		}
	}, [periods, setExpandedPeriods]);

	const toggleAll = () => {
		if (isAllExpanded) {
			setExpandedPeriods(new Set());
			setIsAllExpanded(false);
		} else {
			setExpandedPeriods(new Set(periods.map((p) => p.id)));
			setIsAllExpanded(true);
		}
	};

	const handleAddTaskForPeriod = (periodId: string) => {
		setAddTaskDefaultPeriodId(periodId);
		setShowAddTaskModal(true);
	};


	const handleAddTaskModalClose = () => {
		setShowAddTaskModal(false);
		setAddTaskDefaultPeriodId(null);
	};

	const handleDeletePeriodConfirm = async () => {
		if (!showDeletePeriodConfirm) return;
		await deletePeriod(showDeletePeriodConfirm);
		setShowDeletePeriodConfirm(null);
	};

	const handleDeleteTaskConfirm = async () => {
		if (!showDeleteTaskConfirm) return;
		await deleteTask(showDeleteTaskConfirm);
		setShowDeleteTaskConfirm(null);
	};

	const handleTakeIntoWork = (task: Task) => {
		setTakingTask(task);
	};

	const deletePeriodTaskCount = showDeletePeriodConfirm
		? (tasksByCreationPeriod[showDeletePeriodConfirm]?.length ?? 0)
		: 0;

	const affectedActivePeriodTaskCount = showDeletePeriodConfirm
		? (tasksByActivePeriod[showDeletePeriodConfirm] ?? [])
				.filter((t) => t.creation_period_id !== showDeletePeriodConfirm).length
		: 0;

	return (
		<div className="flex flex-col gap-4 p-0 sm:gap-5 sm:p-6">
			<PageHeader eyebrow="Задачи от QA" title="Новые задачи" />

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Button variant="outline" size="sm" onClick={() => setShowCreatePeriodModal(true)} className="w-full sm:w-auto">
					<Plus className="h-4 w-4 mr-1" />
					Добавить период
				</Button>
				<div className="flex w-full items-center gap-2 sm:w-auto">
					<SearchInput onChange={setQuery} className="flex-1 min-w-0 sm:w-64 sm:flex-none" />
					{periods.length > 0 && (
						<Button variant="outline" size="sm" onClick={toggleAll} className="shrink-0 w-fit sm:w-[8rem]">
							{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{visiblePeriods.map((period) => {
					const allPeriodTasks = tasksByCreationPeriod[period.id] ?? [];
					const periodTasks = isSearching
						? (matchedTasksByPeriod.get(period.id) ?? [])
						: allPeriodTasks;

					return (
						<QAPeriodSection
							key={period.id}
							period={period}
							tasks={periodTasks}
							isExpanded={isSearching ? true : expandedPeriods.has(period.id)}
							onToggle={() => toggleExpansion(period.id)}
							onAddTask={handleAddTaskForPeriod}
							onDeletePeriod={setShowDeletePeriodConfirm}
							onTakeIntoWork={handleTakeIntoWork}
							onDeleteTask={setShowDeleteTaskConfirm}
							onEdit={setEditingTask}
							onOpenComment={setCommentingTask}
							totalTaskCount={periodTasks.length}
							criticalCount={periodTasks.filter((t) => t.priority === 'Критический').length}
						/>
					);
				})}
				{isSearching && visiblePeriods.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">Нет задач</p>
				)}
			</div>

			<CreatePeriodModal
				open={showCreatePeriodModal}
				onClose={() => setShowCreatePeriodModal(false)}
			/>

			<AddTaskModal
				open={showAddTaskModal}
				onClose={handleAddTaskModalClose}
				defaultPeriodId={addTaskDefaultPeriodId ?? undefined}
			/>

			{editingTask !== null && (
				<EditTaskModal
					open={true}
					onClose={() => setEditingTask(null)}
					task={editingTask}
					context="current"
				/>
			)}

			{takingTask !== null && (
				<TakeIntoWorkModal
					open={true}
					onClose={() => setTakingTask(null)}
					task={takingTask}
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
				open={showDeletePeriodConfirm !== null}
				onClose={() => setShowDeletePeriodConfirm(null)}
				onConfirm={handleDeletePeriodConfirm}
				title="Удалить период"
				message={
					affectedActivePeriodTaskCount > 0
						? `Будут удалены все задачи периода (${deletePeriodTaskCount} шт.). Также у ${affectedActivePeriodTaskCount} задач из других периодов будет сброшен активный период.`
						: `Будут удалены все задачи периода (${deletePeriodTaskCount} шт.).`
				}
			/>

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
