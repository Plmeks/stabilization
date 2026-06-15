'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
	startDate: string | null;
	endDate: string | null;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	error?: string;
}

export function DateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	error,
}: DateRangePickerProps) {
	const [startOpen, setStartOpen] = React.useState(false);
	const [endOpen, setEndOpen] = React.useState(false);

	const startDateObj = startDate ? dayjs(startDate).toDate() : undefined;
	const endDateObj = endDate ? dayjs(endDate).toDate() : undefined;

	const handleStartSelect = (date: Date | undefined) => {
		if (date) {
			onStartDateChange(dayjs(date).format('YYYY-MM-DD'));
			setStartOpen(false);
		}
	};

	const handleEndSelect = (date: Date | undefined) => {
		if (date) {
			onEndDateChange(dayjs(date).format('YYYY-MM-DD'));
			setEndOpen(false);
		}
	};

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
				<div className="flex min-w-0 flex-col gap-1 sm:flex-1">
					<span className="text-xs text-muted-foreground">Дата начала</span>
					<Popover open={startOpen} onOpenChange={setStartOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full justify-start text-left font-normal',
									!startDate && 'text-muted-foreground',
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDate ? dayjs(startDate).format('DD.MM.YYYY') : 'Выберите дату'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={startDateObj}
								onSelect={handleStartSelect}

							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex min-w-0 flex-col gap-1 sm:flex-1">
					<span className="text-xs text-muted-foreground">Дата конца</span>
					<Popover open={endOpen} onOpenChange={setEndOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full justify-start text-left font-normal',
									!endDate && 'text-muted-foreground',
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{endDate ? dayjs(endDate).format('DD.MM.YYYY') : 'Выберите дату'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={endDateObj}
								onSelect={handleEndSelect}

							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			{error && (
				<p className="text-xs text-destructive">{error}</p>
			)}
		</div>
	);
}
