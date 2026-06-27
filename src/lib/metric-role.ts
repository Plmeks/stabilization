/**
 * Ролевая раскраска чисел — как в PDF-отчёте (ReportDocument):
 *  neutral — всегда ink (итоги, в работе, в тесте, бэклог);
 *  success — зелёный, если > 0 (решено/выполнено — это успех), иначе ink;
 *  danger  — красный, если > 0 (критичные незавершённые/добавленные, блок), иначе ink;
 *  warn    — оранжевый, если > 0 (некритичные незавершённые/добавленные), иначе ink.
 * Ноль всегда нейтральный, чтобы не «шуметь» цветом.
 */
export type MetricRole = 'neutral' | 'success' | 'danger' | 'warn';

const ROLE_VAR: Record<MetricRole, string> = {
	neutral: 'var(--foreground)',
	success: 'var(--success)',
	danger: 'var(--danger)',
	warn: 'var(--warn)',
};

export function roleColor(value: number, role: MetricRole): string {
	if (role === 'neutral') return ROLE_VAR.neutral;
	return value > 0 ? ROLE_VAR[role] : ROLE_VAR.neutral;
}
