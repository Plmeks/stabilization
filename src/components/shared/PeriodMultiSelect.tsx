'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatPeriodLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Period } from '@/types';

interface PeriodMultiSelectProps {
	/** Все периоды (в любом порядке) — компонент сам выводит обе сортировки. */
	periods: Period[];
	/** id выбранных периодов. */
	value: string[];
	onChange: (ids: string[]) => void;
}

/**
 * Мультиселект периодов для графиков: чекбокс на каждый период. В свёрнутом поле —
 * «лента периодов»: по сегменту на период (старые слева), залит = включён, бледный =
 * снят, рядом счётчик «N из M». Список в раскрытом виде — от новых к старым, с
 * переключателем «Выбрать всё / Снять всё». Перекликается с лентой стабильности.
 */
export function PeriodMultiSelect({ periods, value, onChange }: PeriodMultiSelectProps) {
	const selectedSet = React.useMemo(() => new Set(value), [value]);

	// Лента — старые слева; список — новые сверху.
	const oldestFirst = React.useMemo(
		() => [...periods].sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date))),
		[periods],
	);
	const newestFirst = React.useMemo(() => [...oldestFirst].reverse(), [oldestFirst]);

	const total = periods.length;
	const count = value.length;

	const toggle = (id: string) => {
		if (selectedSet.has(id)) {
			onChange(value.filter((v) => v !== id));
		} else {
			onChange([...value, id]);
		}
	};

	const toggleAll = () => {
		onChange(count > 0 ? [] : periods.map((p) => p.id));
	};

	// В свёрнутом поле: «N из M», затем диапазон выбранного от более нового
	// периода к более старому — «с <новый> по <старый>». 0 — заглушка;
	// 1 — один период без «с/по».
	const selectedOldestFirst = React.useMemo(
		() => oldestFirst.filter((p) => selectedSet.has(p.id)),
		[oldestFirst, selectedSet],
	);
	const newestLabel =
		count > 0 ? formatPeriodLabel(selectedOldestFirst[selectedOldestFirst.length - 1]) : '';
	const oldestLabel = count > 0 ? formatPeriodLabel(selectedOldestFirst[0]) : '';

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={
						count === 0
							? 'Периоды на графике: не выбрано'
							: count === 1
								? `Периоды на графике: выбран период ${newestLabel}`
								: `Периоды на графике: выбрано ${count} из ${total}, с ${newestLabel} по ${oldestLabel}`
					}
					className="flex min-h-[3.25rem] w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					{count === 0 ? (
						<span className="text-muted-foreground">Не выбрано</span>
					) : count === 1 ? (
						<span className="flex min-w-0 items-center gap-2.5">
							<span className="shrink-0 font-medium tabular-nums">
								{count} из {total}
							</span>
							<span className="truncate tabular-nums text-muted-foreground">{newestLabel}</span>
						</span>
					) : (
						<span className="flex min-w-0 items-start gap-2.5 leading-5">
							{/* «N из M» стоит особняком слева; вторая строка из-за него с отступом,
							   поэтому «по» оказывается ровно под «с». */}
							<span className="shrink-0 pt-px font-medium tabular-nums">
								{count} из {total}
							</span>
							<span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-0.5 text-muted-foreground">
								<span>с</span>
								<span className="truncate tabular-nums">{newestLabel}</span>
								<span>по</span>
								<span className="truncate tabular-nums">{oldestLabel}</span>
							</span>
						</span>
					)}
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={6}
				className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden"
				style={{ padding: 0, gap: 0 }}
			>
				<div className="flex items-center justify-between border-b border-border px-3 py-2">
					<span className="text-xs tabular-nums text-muted-foreground">
						Выбрано {count} из {total}
					</span>
					<button
						type="button"
						onClick={toggleAll}
						className="rounded text-xs font-medium text-foreground transition-colors hover:text-muted-foreground"
					>
						{count > 0 ? 'Снять всё' : 'Выбрать всё'}
					</button>
				</div>
				<div className="max-h-60 overflow-y-auto overscroll-contain p-1">
					{newestFirst.map((p) => {
						const selected = selectedSet.has(p.id);
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => toggle(p.id)}
								className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
							>
								<span
									className={cn(
										'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
										selected ? 'border-foreground bg-foreground text-background' : 'border-input',
									)}
								>
									{selected && <Check className="h-3 w-3" />}
								</span>
								<span className="truncate tabular-nums">{formatPeriodLabel(p)}</span>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
