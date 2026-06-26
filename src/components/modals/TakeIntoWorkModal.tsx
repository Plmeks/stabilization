'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AssigneeMultiSelect } from '@/components/shared/AssigneeMultiSelect';
import { takeIntoWorkAtom } from '@/atoms/tasksAtom';
import { parseAssignees, serializeAssignees } from '@/lib/utils';
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
	const [assignees, setAssignees] = React.useState<string[]>(parseAssignees(task.assignee));
	const [loading, setLoading] = React.useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await takeIntoWork({ id: task.id, assignee: serializeAssignees(assignees) });
			onClose();
		} finally {
			setLoading(false);
		}
	};

	const footer = (
		<>
			<Button variant="outline" type="button" onClick={onClose} disabled={loading}>
				Отмена
			</Button>
			<Button type="submit" disabled={loading}>
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
			onSubmit={handleConfirm}
		>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="take-assignee">Исполнители</Label>
				<AssigneeMultiSelect
					id="take-assignee"
					value={assignees}
					onChange={setAssignees}
					disabled={loading}
				/>
			</div>
		</ModalWrapper>
	);
}

export function TakeIntoWorkModal({ open, onClose, task }: TakeIntoWorkModalProps) {
	if (!open) return null;
	return <TakeIntoWorkModalContent key={task.id} onClose={onClose} task={task} />;
}
