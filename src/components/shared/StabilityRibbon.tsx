/**
 * «Лента стабильности» — фирменный мотив, перенесённый из PDF-отчёта.
 * Кодирует состояния: готово (зелёный) → поток/WIP (синий) → критично (красный).
 */
export function StabilityRibbon({ className }: { className?: string }) {
	return (
		<div className={className ? `stability-ribbon ${className}` : 'stability-ribbon'} aria-hidden>
			<span style={{ background: 'var(--success)' }} />
			<span style={{ background: 'var(--wip)' }} />
			<span style={{ background: 'var(--danger)' }} />
		</div>
	);
}
