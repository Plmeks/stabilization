'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
	onEdit?: () => void;
	onDelete: () => void;
	disabled?: boolean;
}

export function ActionButtons({ onEdit, onDelete, disabled = false }: ActionButtonsProps) {
	return (
		<div className="flex items-center gap-1">
			{onEdit !== undefined && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onEdit}
					disabled={disabled}
					aria-label="Редактировать"
				>
					<Pencil className="h-4 w-4" />
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-destructive hover:text-destructive"
				onClick={onDelete}
				disabled={disabled}
				aria-label="Удалить"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
