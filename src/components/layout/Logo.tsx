import * as React from 'react';

/**
 * Логотип Stabana: зелёная шестерёнка (трапециевидные зубья — настоящий
 * механический силуэт) с галочкой в ступице, обёрнутая двумя круговыми
 * стрелками («цикл стабилизации»). Шестерёнка/галочка — зелёные, стрелки —
 * чёрные. Самодостаточный SVG, читается от 24px.
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
			style={{ color: 'var(--success)' }}
		>
			{/* Круговые стрелки — цикл (две дуги навстречу друг другу). Чёрные. */}
			<g
				stroke="var(--foreground)"
				strokeWidth={2.1}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			>
				<path d="M38.2 38.2 A20.2 20.2 0 0 1 6.0 15.2" />
				<path d="M9.8 9.8 A20.2 20.2 0 0 1 42.0 32.8" />
			</g>
			<g fill="var(--foreground)">
				<path d="M7.4 11.6 L2.9 13.4 L8.4 16.2 Z" />
				<path d="M40.6 36.4 L45.1 34.6 L39.6 31.8 Z" />
			</g>

			{/* Тело шестерёнки. */}
			<path d={gearPath} fill="currentColor" />
			{/* Белая ступица (внутренний круг с галочкой). */}
			<circle cx={24} cy={24} r={9.4} fill="var(--card)" />
			{/* Галочка в ступице. */}
			<path
				d="M20.5 24.1 L23 26.7 L27.8 20.4"
				stroke="currentColor"
				strokeWidth={2.4}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
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
