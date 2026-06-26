'use client';

import { ChartsSection } from '@/components/stats/charts/ChartsSection';
import { PageHeader } from '@/components/shared/PageHeader';

export default function ChartsPage() {
	return (
		<div className="flex flex-col gap-4 p-0 sm:gap-5 sm:p-2 md:p-6">
			<PageHeader eyebrow="Динамика стабильности" title="Графический отчёт" />
			<ChartsSection />
		</div>
	);
}
