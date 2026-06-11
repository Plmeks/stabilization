import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/types/constants';
import type { TaskStatus } from '@/types/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
	status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn(STATUS_COLORS[status])}
		>
			{status}
		</Badge>
	);
}
