import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/types/constants';
import type { TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
	status: TaskStatus | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	if (status === null) {
		return null;
	}

	return (
		<Badge
			variant="outline"
			className={cn('rounded-full px-2.5 py-0.5', STATUS_COLORS[status])}
		>
			{status}
		</Badge>
	);
}
