'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
	/** Called with the debounced query value (cleared immediately, no debounce). */
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	debounceMs?: number;
}

export function SearchInput({
	onChange,
	placeholder = 'Поиск',
	className,
	debounceMs = 300,
}: SearchInputProps) {
	const [text, setText] = React.useState('');

	// Keep the latest callback without re-arming the debounce timer.
	const onChangeRef = React.useRef(onChange);
	React.useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	React.useEffect(() => {
		const handle = setTimeout(() => {
			onChangeRef.current(text);
		}, debounceMs);
		return () => clearTimeout(handle);
	}, [text, debounceMs]);

	const handleClear = () => {
		setText('');
		onChangeRef.current('');
	};

	return (
		<div className={cn('relative w-full sm:w-64', className)}>
			<Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				value={text}
				onChange={(event) => setText(event.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
				className="pl-8 pr-8"
			/>
			{text.length > 0 && (
				<button
					type="button"
					onClick={handleClear}
					aria-label="Очистить поиск"
					className="absolute right-1.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
