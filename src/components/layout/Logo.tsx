import * as React from 'react';

/**
 * Логотип Stabana: шестерёнка (трапециевидные зубья) с круглой ступицей,
 * разделённой осями x/y на 4 сектора нашими цветами (зелёный/синий/красный/
 * оранжевый). Самодостаточный SVG.
 *
 * Варианты:
 *  - по умолчанию: ink-шестерёнка + синие круговые стрелки + белая обводка
 *    (для светлых поверхностей — навбар/модалка входа);
 *  - arrows={false}: без стрелок, шестерёнка крупнее (как фавиконка). Хорошо
 *    для тёмного фона с gearFill="#ffffff".
 */
export function Logo({
	size = 36,
	className,
	arrows = true,
	gearFill = 'var(--foreground)',
	ring = true,
}: {
	size?: number;
	className?: string;
	arrows?: boolean;
	gearFill?: string;
	ring?: boolean;
}) {
	// Без стрелок шестерёнка заполняет холст сильнее.
	const rTip = arrows ? 17.8 : 21.5;
	const rRoot = arrows ? 14.8 : 18.0;
	const rHub = arrows ? 10 : 12.4;

	const gearPath = React.useMemo(() => buildGear(9, 24, 24, rTip, rRoot), [rTip, rRoot]);

	const lo = (24 - rHub).toFixed(1);
	const hi = (24 + rHub).toFixed(1);

	// 4 «лампочки» ступицы: всегда цветные, по наведению загораются по кругу
	// (зелёная → синяя → красная → оранжевая). delay задаёт бегущий огонёк.
	const bulbs = [
		{ d: `M24 24 L${lo} 24 A${rHub} ${rHub} 0 0 1 24 ${lo} Z`, color: 'var(--success)', delay: '0s' },
		{ d: `M24 24 L24 ${lo} A${rHub} ${rHub} 0 0 1 ${hi} 24 Z`, color: 'var(--wip)', delay: '0.45s' },
		{ d: `M24 24 L${hi} 24 A${rHub} ${rHub} 0 0 1 24 ${hi} Z`, color: 'var(--danger)', delay: '0.9s' },
		{ d: `M24 24 L24 ${hi} A${rHub} ${rHub} 0 0 1 ${lo} 24 Z`, color: 'var(--warn)', delay: '1.35s' },
	];

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 48 48"
			fill="none"
			role="img"
			aria-label="Stabana"
			className={className ? `logo-mark ${className}` : 'logo-mark'}
		>
			{arrows && (
				<>
					{/* Круговые стрелки — «круговорот задач» (синие, WIP/поток). */}
					<g stroke="var(--wip)" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" fill="none">
						<path d="M39.42 39.42 A21.8 21.8 0 0 1 4.41 14.44" />
						<path d="M8.58 8.58 A21.8 21.8 0 0 1 43.59 33.56" />
					</g>
					<g fill="var(--wip)">
						<path d="M6.12 10.94 L1.53 13.04 L7.29 15.84 Z" />
						<path d="M41.88 37.06 L46.47 34.96 L40.71 32.16 Z" />
					</g>
				</>
			)}

			{/* Тело шестерёнки. */}
			<path d={gearPath} fill={gearFill} />

			{/* Ступица: 4 цветных «лампочки» (сектора), загораются по кругу при наведении. */}
			<g>
				{bulbs.map((b) => (
					<path
						key={b.delay}
						className="logo-bulb"
						d={b.d}
						fill={b.color}
						style={{ color: b.color, animationDelay: b.delay }}
					/>
				))}
			</g>

			{/* Тонкие белые оси x/y — секторы как кусочки пирога. */}
			<g stroke="var(--card)" strokeWidth={arrows ? 0.6 : 0.9}>
				<line x1={lo} y1={24} x2={hi} y2={24} />
				<line x1={24} y1={lo} x2={24} y2={hi} />
			</g>

			{/* Белая обводка: внешний край на краю пирога, толщина уходит внутрь. */}
			{ring && (
				<circle cx={24} cy={24} r={rHub - 0.8} fill="none" stroke="var(--card)" strokeWidth={1.6} />
			)}
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
