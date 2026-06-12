'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { updateTaskAtom, returnTaskToWorkAtom } from '@/atoms/tasksAtom';
import { PRIORITIES, TASK_STATUSES } from '@/types/constants';
import type { Task, Priority, TaskStatus, UpdateTaskInput } from '@/types';
import { CompleteTaskModal } from './CompleteTaskModal';

interface EditTaskModalProps {
	open: boolean;
	onClose: () => void;
	task: Task;
	context: 'current' | 'completed';
}

interface EditTaskModalContentProps {
	onClose: () => void;
	task: Task;
	context: 'current' | 'completed';
}

function EditTaskModalContent({ onClose, task, context }: EditTaskModalContentProps) {
	const updateTask = useSetAtom(updateTaskAtom);
	const returnTaskToWork = useSetAtom(returnTaskToWorkAtom);

	const [title, setTitle] = React.useState(task.title);
	const [assignee, setAssignee] = React.useState(task.assignee ?? '');
	const [priority, setPriority] = React.useState<Priority | ''>(task.priority ?? '');
	const [status, setStatus] = React.useState<TaskStatus>(task.status ?? 'В работе');
	const [link, setLink] = React.useState(task.link ?? '');
	const [loading, setLoading] = React.useState(false);
	const [showCompleteModal, setShowCompleteModal] = React.useState(false);
	const [pendingUpdate, setPendingUpdate] = React.useState<UpdateTaskInput | undefined>(undefined);

	const handleSave = async () => {
		if (context === 'current' && status === 'Завершена') {
			setPendingUpdate({
				title: title.trim() || task.title,
				assignee: assignee.trim() || undefined,
				priority: priority || null,
				link: link.trim() || null,
			});
			setShowCompleteModal(true);
			return;
		}

		const input: UpdateTaskInput = {
			title: title.trim() || task.title,
			assignee: assignee.trim() || undefined,
			priority: priority || null,
			status,
			link: link.trim() || null,
		};

		setLoading(true);
		try {
			if (context === 'completed' && status !== 'Завершена') {
				await returnTaskToWork({ id: task.id, input });
			} else {
				await updateTask({ id: task.id, input });
			}
			onClose();
		} finally {
			setLoading(false);
		}
	};

	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={loading}>
				Отмена
			</Button>
			<Button onClick={handleSave} disabled={loading}>
				Сохранить
			</Button>
		</>
	);

	return (
		<>
			<ModalWrapper
				open={!showCompleteModal}
				onClose={onClose}
				title="Редактировать задачу"
				footer={footer}
			>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="edit-title">Название</Label>
						<Input
							id="edit-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Название задачи"
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="edit-assignee">Исполнитель</Label>
						<Input
							id="edit-assignee"
							placeholder="Не указан"
							value={assignee}
							onChange={(e) => setAssignee(e.target.value)}
							disabled={loading}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Приоритет</Label>
						<Select
							value={priority}
							onValueChange={(val) => setPriority(val === '__none__' ? '' : val as Priority)}
							disabled={loading}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Не указан" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none__">Не указан</SelectItem>
								{PRIORITIES.map((p) => (
									<SelectItem key={p} value={p}>{p}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Статус</Label>
						<Select
							value={status}
							onValueChange={(val) => setStatus(val as TaskStatus)}
							disabled={loading}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TASK_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>{s}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="edit-link">Ссылка (необязательно)</Label>
						<Input
							id="edit-link"
							value={link}
							onChange={(e) => setLink(e.target.value)}
							placeholder="https://..."
							disabled={loading}
						/>
					</div>
				</div>
			</ModalWrapper>

			<CompleteTaskModal
				open={showCompleteModal}
				onClose={() => {
					setShowCompleteModal(false);
					onClose();
				}}
				onCancel={() => setShowCompleteModal(false)}
				taskId={task.id}
				pendingTaskUpdate={pendingUpdate}
			/>
		</>
	);
}

export function EditTaskModal({ open, onClose, task, context }: EditTaskModalProps) {
	if (!open) return null;
	return <EditTaskModalContent onClose={onClose} task={task} context={context} />;
}
