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
			className={cn(PRIORITY_COLORS[priority])}
		>
			{priority}
		</Badge>
	);
}
