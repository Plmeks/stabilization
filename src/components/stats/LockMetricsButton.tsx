'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { lockPeriodMetricsAtom } from '@/atoms/statsAtom';

interface LockMetricsButtonProps {
	periodId: string;
	loading?: boolean;
}

export default function LockMetricsButton({ periodId, loading: externalLoading }: LockMetricsButtonProps) {
	const [internalLoading, setInternalLoading] = React.useState(false);
	const lockMetrics = useSetAtom(lockPeriodMetricsAtom);

	const isLoading = internalLoading || externalLoading;

	const handleClick = async () => {
		setInternalLoading(true);
		try {
			await lockMetrics(periodId);
		} finally {
			setInternalLoading(false);
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleClick}
			disabled={isLoading}
		>
			{isLoading && <Loader2 className="animate-spin" />}
			Зафиксировать метрики
		</Button>
	);
}
