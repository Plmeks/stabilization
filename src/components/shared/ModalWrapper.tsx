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
	/**
	 * Если задан — содержимое оборачивается в <form>, и нажатие Enter в обычном
	 * поле подтверждает действие (в <textarea> Enter по-прежнему переносит строку).
	 * Основная кнопка футера должна быть type="submit", «Отмена» — type="button".
	 */
	onSubmit?: () => void;
}

export function ModalWrapper({
	open,
	onClose,
	title,
	children,
	footer,
	size = 'md',
	onSubmit,
}: ModalWrapperProps) {
	const body = (
		<>
			<div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-4">
				{children}
			</div>
			<DialogFooter className="mx-0 mb-0 mt-0 shrink-0 gap-3 px-6 py-4">
				{footer ?? (
					<Button variant="outline" type="button" onClick={onClose}>
						Закрыть
					</Button>
				)}
			</DialogFooter>
		</>
	);

	// Enter подтверждает действие даже когда фокус не в поле ввода (например,
	// клик по пустой области модалки фокусирует сам DialogContent). Вешаем
	// обработчик на DialogContent — он ловит Enter из любого места внутри.
	// В textarea/кнопках/выпадашках (которые сами останавливают событие или
	// помечают defaultPrevented) — поведение по умолчанию.
	const handleEnterKey = (e: React.KeyboardEvent) => {
		if (!onSubmit) return;
		if (e.key !== 'Enter' || e.defaultPrevented || e.nativeEvent.isComposing) return;
		const el = e.target as HTMLElement;
		if (el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON' || el.isContentEditable) return;
		e.preventDefault();
		onSubmit();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
			<DialogContent
				showCloseButton
				onKeyDown={onSubmit ? handleEnterKey : undefined}
				className={cn(
					// overflow-visible (а не hidden): выпадашки внутри модалки (например
					// мультиселект исполнителей) позиционируются fixed относительно этого
					// контейнера из-за translate-центрирования — overflow-hidden их обрезал.
					// Скролл длинных модалок остаётся на внутреннем теле (overflow-y-auto).
					'flex max-h-[calc(100dvh-0.5rem)] flex-col gap-0 overflow-visible p-0',
					sizeClasses[size],
				)}
			>
				<DialogHeader className="shrink-0 px-6 pt-6">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{onSubmit ? (
					<form
						className="flex min-h-0 flex-1 flex-col"
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit();
						}}
					>
						{body}
					</form>
				) : (
					body
				)}
			</DialogContent>
		</Dialog>
	);
}
