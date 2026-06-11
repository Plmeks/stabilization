'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sizeClasses: Record<NonNullable<ModalWrapperProps['size']>, string> = {
	sm: 'sm:max-w-sm',
	md: 'sm:max-w-lg',
	lg: 'sm:max-w-2xl',
};

interface ModalWrapperProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg';
}

export function ModalWrapper({
	open,
	onClose,
	title,
	children,
	footer,
	size = 'md',
}: ModalWrapperProps) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
			<DialogContent
				showCloseButton
				className={cn(sizeClasses[size])}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
				<DialogFooter>
					{footer ?? (
						<Button variant="outline" onClick={onClose}>
							Закрыть
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
