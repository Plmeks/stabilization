'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormatCardProps {
	icon: LucideIcon;
	title: string;
	hint: string;
	selected: boolean;
	onSelect: () => void;
}

/** Плитка выбора формата отчёта (радио-логика: выбран только один). */
export function FormatCard({ icon: Icon, title, hint, selected, onSelect }: FormatCardProps) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={cn(
				'group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				selected
					? 'border-primary bg-primary/5 shadow-sm'
					: 'border-border hover:border-primary/40 hover:bg-muted/40',
			)}
		>
			<span
				className={cn(
					'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
					selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
				)}
			>
				<Icon className="h-5 w-5" />
			</span>
			<span className="text-sm font-semibold">{title}</span>
			<span className="text-xs text-muted-foreground">{hint}</span>
		</button>
	);
}
