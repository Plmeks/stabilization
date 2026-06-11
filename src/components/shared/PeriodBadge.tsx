import { Badge } from '@/components/ui/badge';
import type { Period } from '@/types';
import { formatPeriodLabel } from '@/lib/utils';

interface PeriodBadgeProps {
	period: Period;
}

export function PeriodBadge({ period }: PeriodBadgeProps) {
	return (
		<Badge variant="outline" className="rounded-full px-2.5 py-0.5 font-normal text-muted-foreground">
			{formatPeriodLabel(period)}
		</Badge>
	);
}
