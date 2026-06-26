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
			{/* Круговые стрелки — цикл (две дуги навстречу друг другу). Чёрные.
			    Радиус увеличен (21.8) — больше отступ от шестерёнки. */}
			<g
				stroke="var(--foreground)"
				strokeWidth={2.1}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			>
				<path d="M39.42 39.42 A21.8 21.8 0 0 1 4.41 14.44" />
				<path d="M8.58 8.58 A21.8 21.8 0 0 1 43.59 33.56" />
			</g>
			<g fill="var(--foreground)">
				<path d="M6.12 10.94 L1.53 13.04 L7.29 15.84 Z" />
				<path d="M41.88 37.06 L46.47 34.96 L40.71 32.16 Z" />
			</g>

			{/* Тело шестерёнки. */}
			<path d={gearPath} fill="currentColor" />
			{/* Белая ступица (внутренний круг с галочкой). */}
			<circle cx={24} cy={24} r={9.4} fill="var(--card)" />
			{/* Галочка в ступице — крупнее и чуть толще. */}
			<path
				d="M20.08 24.11 L22.88 27.02 L28.26 19.97"
				stroke="currentColor"
				strokeWidth={2.8}
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
