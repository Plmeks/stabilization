import * as React from 'react';

/**
 * Логотип Stabana: чёрная шестерёнка (трапециевидные зубья), в ступице — круг,
 * разделённый осями на 4 сектора нашими цветами (синий/оранжевый/красный/
 * зелёный). Обёрнута двумя синими круговыми стрелками («круговорот задач»).
 * Самодостаточный SVG, читается от 24px.
 */
export function Logo({
	size = 36,
	className,
}: {
	size?: number;
	className?: string;
}) {
	// Силуэт шестерёнки строим программно: трапециевидные зубья с фасками.
	// rTip — вершины зубьев, rRoot — основание (толще обод → короче зубья).
	const gearPath = React.useMemo(() => buildGear(9, 24, 24, 16.8, 13.9), []);

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 48 48"
			fill="none"
			role="img"
			aria-label="Stabana"
			className={className}
		>
			{/* Круговые стрелки — «круговорот задач» (две дуги навстречу друг другу).
			    Синие (WIP/поток) — перекликаются с синим в ленте под навбаром.
			    Радиус 21.8 — отступ от шестерёнки. */}
			<g
				stroke="var(--wip)"
				strokeWidth={2.1}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			>
				<path d="M39.42 39.42 A21.8 21.8 0 0 1 4.41 14.44" />
				<path d="M8.58 8.58 A21.8 21.8 0 0 1 43.59 33.56" />
			</g>
			<g fill="var(--wip)">
				<path d="M6.12 10.94 L1.53 13.04 L7.29 15.84 Z" />
				<path d="M41.88 37.06 L46.47 34.96 L40.71 32.16 Z" />
			</g>

			{/* Тело шестерёнки — чёрное. */}
			<path d={gearPath} fill="var(--foreground)" />
			{/* Ступица: круг (r=9.4), разделённый осями x/y на 4 ровных сектора.
			    По часовой от верха-правого: синий → оранжевый → красный → зелёный. */}
			<g>
				<path d="M24 24 L24 14.6 A9.4 9.4 0 0 1 33.4 24 Z" fill="var(--wip)" />
				<path d="M24 24 L33.4 24 A9.4 9.4 0 0 1 24 33.4 Z" fill="var(--warn)" />
				<path d="M24 24 L24 33.4 A9.4 9.4 0 0 1 14.6 24 Z" fill="var(--danger)" />
				<path d="M24 24 L14.6 24 A9.4 9.4 0 0 1 24 14.6 Z" fill="var(--success)" />
			</g>
		</svg>
	);
}

/**
 * Путь шестерёнки с N трапециевидными зубьями: впадина → подъём → плоская
 * вершина → спуск, по кругу. Возвращает строку для атрибута d.
 */
function buildGear(teeth: number, cx: number, cy: number, rTip: number, rRoot: number): string {
	const T = (Math.PI * 2) / teeth;
	const pt = (r: number, a: number) =>
		`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;

	let d = '';
	for (let i = 0; i < teeth; i++) {
		const a = i * T;
		d += `${i === 0 ? 'M' : 'L'} ${pt(rRoot, a + T * 0.18)} `;
		d += `L ${pt(rTip, a + T * 0.34)} `;
		d += `L ${pt(rTip, a + T * 0.66)} `;
		d += `L ${pt(rRoot, a + T * 0.82)} `;
	}
	return `${d}Z`;
}
