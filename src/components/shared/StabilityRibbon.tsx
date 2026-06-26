/**
 * 4-цветная «лента стабильности» — фирменный мотив, перенесённый из PDF-отчёта.
 * Кодирует четыре отслеживаемых состояния: готово / критично / некритично / WIP.
 */
export function StabilityRibbon({ className }: { className?: string }) {
	return (
		<div className={className ? `stability-ribbon ${className}` : 'stability-ribbon'} aria-hidden>
			<span style={{ background: 'var(--success)' }} />
			<span style={{ background: 'var(--warn)' }} />
			<span style={{ background: 'var(--wip)' }} />
			<span style={{ background: 'var(--danger)' }} />
		</div>
	);
}
