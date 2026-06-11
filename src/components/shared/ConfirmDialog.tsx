'use client';

import * as React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	destructive?: boolean;
	loading?: boolean;
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Удалить',
	destructive = true,
	loading = false,
}: ConfirmDialogProps) {
	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={loading}>
				Отмена
			</Button>
			<Button
				variant={destructive ? 'destructive' : 'default'}
				onClick={onConfirm}
				disabled={loading}
			>
				{confirmLabel}
			</Button>
		</>
	);

	return (
		<ModalWrapper
			open={open}
			onClose={onClose}
			title={title}
			size="sm"
			footer={footer}
		>
			<p className="text-sm text-muted-foreground">{message}</p>
		</ModalWrapper>
	);
}
