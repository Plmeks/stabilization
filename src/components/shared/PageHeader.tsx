import * as React from 'react';

/**
 * Заголовок страницы в стиле PDF-отчёта: eyebrow-подпись (стадия пайплайна) над
 * крупным ink-заголовком, опциональный meta-чип и блок действий справа.
 */
export function PageHeader({
	eyebrow,
	title,
	meta,
	actions,
}: {
	eyebrow: string;
	title: string;
	meta?: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div className="flex flex-col gap-1.5">
				<span className="eyebrow">{eyebrow}</span>
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
					{meta}
				</div>
			</div>
			{actions && (
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>
			)}
		</div>
	);
}

/** Чип-счётчик «Всего / Крит» в стиле отчёта. */
export function CountChip({
	total,
	critical,
}: {
	total: number;
	critical?: number;
}) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
			Всего: <span className="text-foreground">{total}</span>
			{critical !== undefined && critical > 0 && (
				<>
					<span className="text-border">·</span>
					Крит: <span className="text-danger">{critical}</span>
				</>
			)}
		</span>
	);
}
