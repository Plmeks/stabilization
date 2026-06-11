import type { Period } from '@/types';
import { formatPeriodLabel } from '@/lib/utils';

interface PeriodBadgeProps {
	period: Period;
}

export function PeriodBadge({ period }: PeriodBadgeProps) {
	return (
		<span className="text-xs text-muted-foreground">
			{formatPeriodLabel(period)}
		</span>
	);
}
