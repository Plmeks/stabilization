'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QAPeriodSection } from '@/components/qa/QAPeriodSection';
import { CreatePeriodModal } from '@/components/modals/CreatePeriodModal';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { periodsAtom } from '@/atoms/periodsAtom';
import { deletePeriodAtom } from '@/atoms/periodsAtom';
import { qaTasksAtom, tasksByPeriodAtom, deleteTaskAtom, takeIntoWorkAtom } from '@/atoms/tasksAtom';
import { expandedPeriodsAtom, togglePeriodExpansionAtom } from '@/atoms/uiAtom';

export default function QAPage() {
	const periods = useAtomValue(periodsAtom);
	const qaTasks = useAtomValue(qaTasksAtom);
	const tasksByPeriod = useAtomValue(tasksByPeriodAtom);
	const expandedPeriods = useAtomValue(expandedPeriodsAtom);
	const toggleExpansion = useSetAtom(togglePeriodExpansionAtom);
	const deletePeriod = useSetAtom(deletePeriodAtom);
	const deleteTask = useSetAtom(deleteTaskAtom);
	const takeIntoWork = useSetAtom(takeIntoWorkAtom);

	const [showCreatePeriodModal, setShowCreatePeriodModal] = React.useState(false);
	const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
	const [addTaskDefaultPeriodId, setAddTaskDefaultPeriodId] = React.useState<string | null>(null);
	const [showDeletePeriodConfirm, setShowDeletePeriodConfirm] = React.useState<string | null>(null);
	const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = React.useState<string | null>(null);

	const handleAddTaskForPeriod = (periodId: string) => {
		setAddTaskDefaultPeriodId(periodId);
		setShowAddTaskModal(true);
	};

	const handleAddTaskGeneral = () => {
		setAddTaskDefaultPeriodId(null);
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
		? (tasksByPeriod[showDeletePeriodConfirm]?.length ?? 0)
		: 0;

	return (
		<div className="flex flex-col gap-5 p-6">
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={() => setShowCreatePeriodModal(true)}>
					<Plus className="h-4 w-4 mr-1" />
					Добавить период
				</Button>
			</div>

			<div className="flex flex-col gap-4">
				{periods.map((period) => {
					const periodQATasks = qaTasks.filter((t) => t.period_id === period.id);
					const totalCount = tasksByPeriod[period.id]?.length ?? 0;

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
							totalTaskCount={totalCount}
							criticalCount={(tasksByPeriod[period.id] ?? []).filter((t) => t.priority === 'Авария').length}
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

			<ConfirmDialog
				open={showDeletePeriodConfirm !== null}
				onClose={() => setShowDeletePeriodConfirm(null)}
				onConfirm={handleDeletePeriodConfirm}
				title="Удалить период"
				message={`Будут удалены все задачи периода (${deletePeriodTaskCount} шт.)`}
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
