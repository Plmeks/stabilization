import { parseAssignees } from '@/lib/utils';

/** Отображение исполнителей задачи в таблице: чипы или «Без исполнителя». */
export function AssigneeTags({ value }: { value: string | null }) {
	const names = parseAssignees(value);

	if (names.length === 0) {
		return <span className="text-muted-foreground text-xs">Без исполнителя</span>;
	}

	return (
		<span className="flex flex-wrap gap-1">
			{names.map((name) => (
				<span
					key={name}
					className="inline-flex rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-foreground"
				>
					{name}
				</span>
			))}
		</span>
	);
}
