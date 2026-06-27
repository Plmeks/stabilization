import * as React from 'react';

/**
 * Логотип Stabana: шестерёнка (трапециевидные зубья) с круглой ступицей —
 * сплошной 4-цветный «пирог» (зелёный/синий/красный/оранжевый) без белых
 * разделителей: цвета граничат друг с другом напрямую. По центру пирога —
 * белая галочка («готово/качество»). Самодостаточный SVG.
 *
 * Варианты:
 *  - по умолчанию: ink-шестерёнка + синие круговые стрелки
 *    (для светлых поверхностей — навбар/модалка входа);
 *  - arrows={false}: без стрелок, шестерёнка крупнее (как фавиконка). Хорошо
 *    для тёмного фона с gearFill="#ffffff".
 */
export function Logo({
	size = 36,
	className,
	arrows = true,
	gearFill = 'var(--foreground)',
}: {
	size?: number;
	className?: string;
	arrows?: boolean;
	gearFill?: string;
}) {
	// Без стрелок шестерёнка заполняет холст сильнее.
	const rTip = arrows ? 17.8 : 21.5;
	const rRoot = arrows ? 14.8 : 18.0;
	const rHub = arrows ? 10 : 12.4;

	const gearPath = React.useMemo(() => buildGear(9, 24, 24, rTip, rRoot), [rTip, rRoot]);

	const lo = (24 - rHub).toFixed(1);
	const hi = (24 + rHub).toFixed(1);

	// Белая галочка по центру пирога, масштаб пропорционален ступице.
	const checkPath = React.useMemo(() => buildCheck(rHub / 6.0, 24, 24.3), [rHub]);

	// 4 «лампочки» ступицы: по наведению загораются по кругу. Свечение стартует
	// не сразу: сначала пошла шестерёнка, и лишь примерно через время полного
	// свечения одного сектора секторы начинают разгораться. glowStart — эта
	// стартовая задержка, step — шаг бегущей очереди.
	const glowStart = 0.42;
	const step = 0.45;
	const bulbs = [
		{ d: `M24 24 L${lo} 24 A${rHub} ${rHub} 0 0 1 24 ${lo} Z`, color: 'var(--success)', delay: `${(glowStart + 3 * step).toFixed(2)}s` },
		{ d: `M24 24 L24 ${lo} A${rHub} ${rHub} 0 0 1 ${hi} 24 Z`, color: 'var(--wip)', delay: `${glowStart.toFixed(2)}s` },
		{ d: `M24 24 L${hi} 24 A${rHub} ${rHub} 0 0 1 24 ${hi} Z`, color: 'var(--danger)', delay: `${(glowStart + step).toFixed(2)}s` },
		{ d: `M24 24 L24 ${hi} A${rHub} ${rHub} 0 0 1 ${lo} 24 Z`, color: 'var(--warn)', delay: `${(glowStart + 2 * step).toFixed(2)}s` },
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

			{/* Тело шестерёнки. При наведении медленно проворачивается (механизм
			   работает); цветной пирог и галочка остаются на месте. */}
			<path className="logo-gear" d={gearPath} fill={gearFill} />

			{/* Статичная база пирога — под светящимся слоем: сглаженная кромка
			   анимируемых секторов пропускает правильный цвет, а не белую
			   шестерёнку (иначе на швах — белые волоски). */}
			<g>
				{bulbs.map((b) => (
					<path key={`base-${b.color}`} d={b.d} fill={b.color} />
				))}
			</g>

			{/* Свечение: секторы по очереди разгораются по кругу при наведении
			   (со стартовой задержкой относительно вращения шестерёнки). */}
			<g>
				{bulbs.map((b) => (
					<path
						key={b.color}
						className="logo-bulb"
						d={b.d}
						fill={b.color}
						style={{ animationDelay: b.delay }}
					/>
				))}
			</g>

			{/* Белая галочка по центру пирога — «готово/качество». */}
			<path
				d={checkPath}
				fill="none"
				stroke="var(--card)"
				strokeWidth={rHub / 6.0}
				strokeLinecap="round"
				strokeLinejoin="round"
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

/** Галочка по центру: излом — нижняя точка, центрирована на (cx,cy). */
function buildCheck(scale: number, cx: number, cy: number): string {
	const p = (dx: number, dy: number) =>
		`${(cx + dx * scale).toFixed(2)} ${(cy + dy * scale).toFixed(2)}`;
	return `M ${p(-2.8, -0.1)} L ${p(-0.7, 2.0)} L ${p(3.0, -2.6)}`;
}
