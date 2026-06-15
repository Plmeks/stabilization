'use client';

import { ChartsSection } from '@/components/stats/charts/ChartsSection';

export default function ChartsPage() {
	return (
		<div className="p-0 sm:p-2 md:p-6">
			<h1 className="text-2xl font-semibold mb-4">Графический отчет</h1>
			<ChartsSection />
		</div>
	);
}
