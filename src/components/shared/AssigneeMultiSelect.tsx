'use client';

import * as React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Check, Plus, X } from 'lucide-react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import {
	assigneesAtom,
	createAssigneeAtom,
	deleteAssigneeAtom,
} from '@/atoms/assigneesAtom';
import { cn } from '@/lib/utils';

interface AssigneeMultiSelectProps {
	value: string[];
	onChange: (names: string[]) => void;
	disabled?: boolean;
	id?: string;
}

/**
 * Мультиселект исполнителей в духе antd Select(mode="tags"): выбранные показаны
 * чипами, снизу — фильтруемый по вводу список со скроллом. Можно выбрать
 * несколько, добавить нового (сохраняется в общий список), удалить из списка
 * (✕ при наведении) и не выбрать никого (пусто → «Без исполнителя»).
 */
export function AssigneeMultiSelect({ value, onChange, disabled, id }: AssigneeMultiSelectProps) {
	const options = useAtomValue(assigneesAtom);
	const createAssignee = useSetAtom(createAssigneeAtom);
	const deleteAssignee = useSetAtom(deleteAssigneeAtom);

	const [query, setQuery] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const anchorRef = React.useRef<HTMLDivElement>(null);

	// Поле (input/чипы) живёт в anchor, а не в content — поэтому фокус/клик по нему
	// Radix считает «снаружи» и закрывает поповер. Гасим закрытие в этих случаях.
	const keepOpenOnField = (e: { target: EventTarget | null; preventDefault: () => void }) => {
		if (anchorRef.current?.contains(e.target as Node)) {
			e.preventDefault();
		}
	};

	const selectedSet = React.useMemo(
		() => new Set(value.map((v) => v.toLowerCase())),
		[value],
	);

	const q = query.trim().toLowerCase();
	const filtered = React.useMemo(
		() => options.filter((o) => o.name.toLowerCase().includes(q)),
		[options, q],
	);
	const exactExists =
		options.some((o) => o.name.toLowerCase() === q) || selectedSet.has(q);
	const canCreate = q.length > 0 && !exactExists;

	const toggle = (name: string) => {
		if (selectedSet.has(name.toLowerCase())) {
			onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase()));
		} else {
			onChange([...value, name]);
		}
	};

	const addNew = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		if (!selectedSet.has(trimmed.toLowerCase())) {
			onChange([...value, trimmed]);
		}
		// Сохраняем в общий список (no-op, если уже есть).
		createAssignee(trimmed);
		setQuery('');
	};

	const removeChip = (name: string) => {
		onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase()));
		// Не закрываем список — пользователь видит, как снимается галочка.
		setOpen(true);
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && q.length > 0) {
			// Enter с текстом — добавить/выбрать, не отправляя форму модалки.
			e.preventDefault();
			e.stopPropagation();
			if (canCreate) {
				addNew(query);
			} else {
				const first =
					filtered.find((o) => !selectedSet.has(o.name.toLowerCase())) ?? filtered[0];
				if (first) {
					toggle(first.name);
					setQuery('');
				}
			}
			setOpen(true);
		} else if (e.key === 'Backspace' && query.length === 0 && value.length > 0) {
			onChange(value.slice(0, -1));
		} else if (e.key === 'Escape') {
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverAnchor asChild>
				<div
					ref={anchorRef}
					className={cn(
						'flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 text-sm transition-colors',
						'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
						disabled && 'pointer-events-none opacity-50',
					)}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) {
							inputRef.current?.focus();
							setOpen(true);
						}
					}}
				>
					{value.map((name) => (
						<span
							key={name}
							className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-foreground"
						>
							{name}
							<button
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => removeChip(name)}
								aria-label={`Убрать ${name}`}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
					<input
						ref={inputRef}
						id={id}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						onKeyDown={handleKeyDown}
						disabled={disabled}
						placeholder={value.length === 0 ? 'Без исполнителя' : ''}
						role="combobox"
						aria-expanded={open}
						aria-autocomplete="list"
						// Гасим встроенный браузерный autosuggest/autofill — он перекрывал наш список.
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						data-1p-ignore
						data-lpignore="true"
						name={id ? `assignee-search-${id}` : 'assignee-search'}
						className="min-w-[6rem] flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</PopoverAnchor>
			<PopoverContent
				align="start"
				sideOffset={6}
				portalled={false}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
				onFocusOutside={keepOpenOnField}
				onPointerDownOutside={keepOpenOnField}
				onInteractOutside={keepOpenOnField}
				className="w-(--radix-popover-trigger-width) min-w-56 overflow-hidden p-1"
			>
				<div className="max-h-60 overflow-y-auto overscroll-contain">
					{canCreate && (
						<button
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => addNew(query)}
							className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
						>
							<Plus className="h-3.5 w-3.5 text-success" />
							Добавить «{query.trim()}»
						</button>
					)}
					{filtered.map((o) => {
						const selected = selectedSet.has(o.name.toLowerCase());
						return (
							<div key={o.id} className="group flex items-center rounded-md hover:bg-muted">
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => toggle(o.name)}
									className="flex flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm"
								>
									<span
										className={cn(
											'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
											selected
												? 'border-foreground bg-foreground text-background'
												: 'border-input',
										)}
									>
										{selected && <Check className="h-3 w-3" />}
									</span>
									<span className="truncate">{o.name}</span>
								</button>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => deleteAssignee(o.id)}
									aria-label={`Удалить ${o.name} из списка`}
									className="mr-1 hidden shrink-0 rounded p-1 text-muted-foreground transition-colors group-hover:inline-flex hover:text-danger"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</div>
						);
					})}
					{filtered.length === 0 && !canCreate && (
						<p className="px-2 py-2 text-sm text-muted-foreground">
							{options.length === 0 ? 'Список пуст' : 'Ничего не найдено'}
						</p>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
