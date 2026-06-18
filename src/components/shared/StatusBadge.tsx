import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, BACKLOG_STATUS_LABEL, BACKLOG_STATUS_COLOR } from '@/types/constants';
import type { TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
	status: TaskStatus | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const label = status ?? BACKLOG_STATUS_LABEL;
	const color = status ? STATUS_COLORS[status] : BACKLOG_STATUS_COLOR;

	return (
		<Badge
			variant="outline"
			className={cn('rounded-full px-2.5 py-0.5', color)}
		>
			{label}
		</Badge>
	);
}
