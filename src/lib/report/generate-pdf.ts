import { captureNodeToJpeg } from './capture';

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = dataUrl;
	});
}

/**
 * PDF-снимок отчёта (A4, портрет). Каждая секция (data-report-section) снимается
 * отдельно и стартует с новой страницы — так блок графиков не разрезается между
 * страницами. Внутри секции, если она выше страницы, выполняется постраничная
 * нарезка по высоте. Возвращает Blob.
 *
 * jsPDF грузится динамически — не попадает в основной бандл.
 */
export async function generateReportPdf(node: HTMLElement): Promise<Blob> {
	const sections = Array.from(node.querySelectorAll<HTMLElement>('[data-report-section]'));
	const targets = sections.length > 0 ? sections : [node];

	const { jsPDF } = await import('jspdf');
	const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 8;
	const contentWidth = pageWidth - margin * 2;
	const contentHeight = pageHeight - margin * 2;

	for (let i = 0; i < targets.length; i++) {
		const dataUrl = await captureNodeToJpeg(targets[i]);
		const img = await loadImage(dataUrl);
		const imgHeight = (img.height * contentWidth) / img.width;

		if (i > 0) {
			pdf.addPage();
		}

		if (imgHeight <= contentHeight) {
			pdf.addImage(dataUrl, 'JPEG', margin, margin, contentWidth, imgHeight);
		} else {
			// Секция выше страницы: «прокручиваем» изображение вверх отрицательным
			// смещением по Y на каждой следующей странице.
			let heightLeft = imgHeight;
			let position = margin;

			pdf.addImage(dataUrl, 'JPEG', margin, position, contentWidth, imgHeight);
			heightLeft -= contentHeight;

			while (heightLeft > 0) {
				position -= contentHeight;
				pdf.addPage();
				pdf.addImage(dataUrl, 'JPEG', margin, position, contentWidth, imgHeight);
				heightLeft -= contentHeight;
			}
		}
	}

	return pdf.output('blob');
}
