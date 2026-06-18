'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { takeIntoWorkAtom } from '@/atoms/tasksAtom';
import type { Task } from '@/types';

interface TakeIntoWorkModalProps {
	open: boolean;
	onClose: () => void;
	task: Task;
}

interface TakeIntoWorkModalContentProps {
	onClose: () => void;
	task: Task;
}

function TakeIntoWorkModalContent({ onClose, task }: TakeIntoWorkModalContentProps) {
	const takeIntoWork = useSetAtom(takeIntoWorkAtom);
	const [assignee, setAssignee] = React.useState(task.assignee ?? '');
	const [loading, setLoading] = React.useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await takeIntoWork({ id: task.id, assignee: assignee.trim() || null });
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
				Взять в работу
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={true}
			onClose={onClose}
			title="Взять в работу"
			size="sm"
			footer={footer}
		>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="take-assignee">Укажите исполнителя</Label>
				<Input
					id="take-assignee"
					value={assignee}
					onChange={(e) => setAssignee(e.target.value)}
					placeholder="Исполнитель"
					disabled={loading}
					autoFocus
				/>
			</div>
		</ModalWrapper>
	);
}

export function TakeIntoWorkModal({ open, onClose, task }: TakeIntoWorkModalProps) {
	if (!open) return null;
	return <TakeIntoWorkModalContent key={task.id} onClose={onClose} task={task} />;
}
