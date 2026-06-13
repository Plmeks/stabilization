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
				className={cn(
					'flex max-h-[calc(100dvh-0.5rem)] flex-col gap-0 overflow-hidden p-0',
					sizeClasses[size],
				)}
			>
				<DialogHeader className="shrink-0 px-6 pt-6">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
					{children}
				</div>
				<DialogFooter className="mx-0 mb-0 mt-0 shrink-0 gap-3 px-6 py-4">
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
