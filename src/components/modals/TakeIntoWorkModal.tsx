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
import { takeIntoWorkAtom } from '@/atoms/tasksAtom';
import { PRIORITIES, TASK_STATUSES } from '@/types/constants';
import type { Task, Priority, TaskStatus } from '@/types';

const STATUSES_WITHOUT_COMPLETED = TASK_STATUSES.filter((s) => s !== 'Завершена');

interface TakeIntoWorkModalProps {
	open: boolean;
	onClose: () => void;
	task: Task;
}

export function TakeIntoWorkModal({ open, onClose, task }: TakeIntoWorkModalProps) {
	const [assignee, setAssignee] = React.useState('');
	const [priority, setPriority] = React.useState<Priority | ''>('');
	const [status, setStatus] = React.useState<TaskStatus>('В работе');
	const [loading, setLoading] = React.useState(false);

	const takeIntoWork = useSetAtom(takeIntoWorkAtom);

	React.useEffect(() => {
		if (!open) {
			setAssignee('');
			setPriority('');
			setStatus('В работе');
			setLoading(false);
		}
	}, [open]);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			const input: Parameters<typeof takeIntoWork>[0]['input'] = {};
			if (assignee.trim()) input.assignee = assignee.trim();
			if (priority) input.priority = priority;
			if (status) input.status = status;

			await takeIntoWork({ id: task.id, input });
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
			<Button onClick={handleConfirm} disabled={loading}>
				Подтвердить
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={open}
			onClose={onClose}
			title="Взять в работу"
			size="sm"
			footer={footer}
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="take-assignee">Исполнитель</Label>
					<Input
						id="take-assignee"
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
							{STATUSES_WITHOUT_COMPLETED.map((s) => (
								<SelectItem key={s} value={s}>{s}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</ModalWrapper>
	);
}
