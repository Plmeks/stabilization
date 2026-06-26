import * as React from 'react';

/**
 * Логотип Stabana: зелёная шестерёнка с галочкой в центре, обёрнутая двумя
 * круговыми стрелками — «цикл стабилизации». Самодостаточный SVG, читается
 * от 24px и выше. Цвет наследуется (currentColor), по умолчанию success-зелёный.
 */
export function Logo({
	size = 36,
	className,
}: {
	size?: number;
	className?: string;
}) {
	// 8 зубьев шестерёнки — равномерно по кругу.
	const teeth = Array.from({ length: 8 }, (_, i) => i * 45);

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
				<path d="M37.4 37.4 A19 19 0 0 1 6.8 16.0" />
				<path d="M10.57 10.57 A19 19 0 0 1 41.2 32.0" />
			</g>
			{/* Наконечники стрелок — чёрные. */}
			<g fill="var(--foreground)">
				<path d="M8.28 12.83 L4.08 14.73 L9.52 17.27 Z" />
				<path d="M39.72 35.17 L43.92 33.27 L38.48 30.73 Z" />
			</g>

			{/* Зубья шестерёнки — квадратные. */}
			<g fill="currentColor">
				{teeth.map((a) => (
					<rect
						key={a}
						x={24 - 2.4}
						y={24 - 16.6}
						width={4.8}
						height={5.2}
						rx={0.6}
						transform={`rotate(${a} 24 24)`}
					/>
				))}
			</g>

			{/* Тело шестерёнки и белая ступица. */}
			<circle cx={24} cy={24} r={12.2} fill="currentColor" />
			<circle cx={24} cy={24} r={6.8} fill="var(--card)" />

			{/* Галочка в ступице. */}
			<path
				d="M20.6 24.2 L23 26.6 L27.6 20.8"
				stroke="currentColor"
				strokeWidth={2.4}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</svg>
	);
}
