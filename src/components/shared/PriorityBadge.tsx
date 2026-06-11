import { Badge } from '@/components/ui/badge';
import { PRIORITY_COLORS } from '@/types/constants';
import type { Priority } from '@/types/constants';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
	priority: Priority | null;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
	if (priority === null) {
		return null;
	}

	return (
		<Badge
			variant="outline"
			className={cn('rounded-full px-2.5 py-0.5', PRIORITY_COLORS[priority])}
		>
			{priority}
		</Badge>
	);
}
