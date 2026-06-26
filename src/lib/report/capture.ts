/**
 * Снимок DOM-узла в PNG.
 *
 * Используем html-to-image (а не html2canvas): проект на Tailwind v4 с цветами
 * oklch(), которые html2canvas не поддерживает и падает. html-to-image рендерит
 * узел через SVG foreignObject, поэтому цвета считает сам браузер.
 *
 * Библиотека грузится динамически — не попадает в основной бандл.
 */
export async function captureNodeToPng(node: HTMLElement): Promise<string> {
	const { toPng } = await import('html-to-image');
	return toPng(node, {
		pixelRatio: 2,
		backgroundColor: '#ffffff',
		cacheBust: true,
		width: node.offsetWidth,
		height: node.offsetHeight,
	});
}

/**
 * Снимок узла в JPEG. Используется для встраивания в PDF: jsPDF хранит PNG как
 * несжатые пиксели (огромный файл), а JPEG сжимается в разы при том же качестве.
 */
export async function captureNodeToJpeg(node: HTMLElement, quality = 0.92): Promise<string> {
	const { toJpeg } = await import('html-to-image');
	return toJpeg(node, {
		pixelRatio: 2,
		quality,
		backgroundColor: '#ffffff',
		cacheBust: true,
		width: node.offsetWidth,
		height: node.offsetHeight,
	});
}
