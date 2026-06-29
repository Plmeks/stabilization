import { detectUrls } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskTitleProps {
	title: string;
	className?: string;
}

export function TaskTitle({ title, className }: TaskTitleProps) {
	const segments = detectUrls(title);

	return (
		<span className={cn('break-all', className)}>
			{segments.map((segment, index) =>
				segment.url ? (
					<a
						key={index}
						href={segment.url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-wip underline hover:text-wip/80"
					>
						{segment.text}
					</a>
				) : (
					<span key={index}>{segment.text}</span>
				)
			)}
		</span>
	);
}
