'use client';

import * as React from 'react';
import { Pencil, Trash2, Undo2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
	onEdit?: () => void;
	onComplete?: () => void;
	onDelete?: () => void;
	onReturnToQA?: () => void;
	disabled?: boolean;
}

export function ActionButtons({ onEdit, onComplete, onDelete, onReturnToQA, disabled = false }: ActionButtonsProps) {
	return (
		<div className="flex items-center gap-1">
			{onComplete !== undefined && (
				<Button
					variant="ghost"
					size="icon"
					className="h-9 w-8 text-success hover:text-success cursor-pointer"
					onClick={onComplete}
					disabled={disabled}
					aria-label="Завершить задачу"
					title="Завершить задачу"
				>
					<CheckCircle className="h-5 w-5" />
				</Button>
			)}
			{onEdit !== undefined && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer text-warn hover:text-warn"
					onClick={onEdit}
					disabled={disabled}
					aria-label="Редактировать"
					title="Редактировать"
				>
					<Pencil className="h-4 w-4" />
				</Button>
			)}
			{onReturnToQA !== undefined && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer"
					onClick={onReturnToQA}
					disabled={disabled}
					aria-label="Вернуть в QA"
					title="Вернуть в QA"
				>
					<Undo2 className="h-4 w-4" />
				</Button>
			)}
			{onDelete !== undefined && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-danger hover:text-danger cursor-pointer"
					onClick={onDelete}
					disabled={disabled}
					aria-label="Удалить"
					title="Удалить"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
