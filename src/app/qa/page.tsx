'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QAPeriodSection } from '@/components/qa/QAPeriodSection';
import { CreatePeriodModal } from '@/components/modals/CreatePeriodModal';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { EditQATaskModal } from '@/components/modals/EditQATaskModal';
import { CommentModal } from '@/components/modals/CommentModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { periodsAtom } from '@/atoms/periodsAtom';
import { deletePeriodAtom } from '@/atoms/periodsAtom';
import { qaTasksAtom, tasksByCreationPeriodAtom, tasksByActivePeriodAtom, deleteTaskAtom, takeIntoWorkAtom } from '@/atoms/tasksAtom';
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
	const takeIntoWork = useSetAtom(takeIntoWorkAtom);

	const [isAllExpanded, setIsAllExpanded] = React.useState(false);
	const expandedInitialized = React.useRef(false);

	const [showCreatePeriodModal, setShowCreatePeriodModal] = React.useState(false);
	const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
	const [addTaskDefaultPeriodId, setAddTaskDefaultPeriodId] = React.useState<string | null>(null);
	const [showDeletePeriodConfirm, setShowDeletePeriodConfirm] = React.useState<string | null>(null);
	const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = React.useState<string | null>(null);
	const [editingTask, setEditingTask] = React.useState<Task | null>(null);
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

	const handleTakeIntoWork = async (taskId: string) => {
		await takeIntoWork(taskId);
	};

	const deletePeriodTaskCount = showDeletePeriodConfirm
		? (tasksByCreationPeriod[showDeletePeriodConfirm]?.length ?? 0)
		: 0;

	const affectedActivePeriodTaskCount = showDeletePeriodConfirm
		? (tasksByActivePeriod[showDeletePeriodConfirm] ?? [])
				.filter((t) => t.creation_period_id !== showDeletePeriodConfirm).length
		: 0;

	return (
		<div className="flex flex-col gap-5 p-6">
			<div className="flex items-center justify-between gap-2">
				<Button variant="outline" onClick={() => setShowCreatePeriodModal(true)}>
					<Plus className="h-4 w-4 mr-1" />
					Добавить период
				</Button>
				{periods.length > 0 && (
					<Button variant="outline" size="sm" onClick={toggleAll}>
						{isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-4">
				{periods.map((period) => {
					const periodQATasks = qaTasks.filter((t) => t.creation_period_id === period.id);
					const totalCount = tasksByCreationPeriod[period.id]?.length ?? 0;

					return (
						<QAPeriodSection
							key={period.id}
							period={period}
							tasks={periodQATasks}
							isExpanded={expandedPeriods.has(period.id)}
							onToggle={() => toggleExpansion(period.id)}
							onAddTask={handleAddTaskForPeriod}
							onDeletePeriod={setShowDeletePeriodConfirm}
							onTakeIntoWork={handleTakeIntoWork}
							onDeleteTask={setShowDeleteTaskConfirm}
							onEdit={setEditingTask}
							onOpenComment={setCommentingTask}
							totalTaskCount={totalCount}
							criticalCount={(tasksByCreationPeriod[period.id] ?? []).filter((t) => t.priority === 'Критический').length}
						/>
					);
				})}
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
				<EditQATaskModal
					open={true}
					onClose={() => setEditingTask(null)}
					task={editingTask}
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
