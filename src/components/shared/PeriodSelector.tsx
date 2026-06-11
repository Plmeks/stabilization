'use client';

import * as React from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { formatPeriodLabel } from '@/lib/utils';
import type { Period } from '@/types';

interface PeriodSelectorProps {
	periods: Period[];
	value: string | null;
	onChange: (periodId: string) => void;
	placeholder?: string;
	defaultToLatest?: boolean;
}

export function PeriodSelector({
	periods,
	value,
	onChange,
	placeholder = 'Выберите период',
	defaultToLatest = false,
}: PeriodSelectorProps) {
	React.useEffect(() => {
		if (defaultToLatest && !value && periods.length > 0) {
			onChange(periods[0].id);
		}
	}, [defaultToLatest, value, periods, onChange]);

	return (
		<Select value={value ?? undefined} onValueChange={onChange}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{periods.map((period) => (
					<SelectItem key={period.id} value={period.id}>
						{formatPeriodLabel(period)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
