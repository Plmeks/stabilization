'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { Textarea } from '@/components/ui/textarea';
import { updatePeriodCommentAtom } from '@/atoms/statsAtom';

interface StatsCommentProps {
	statisticsId: string;
	initialComment: string | null;
}

export default function StatsComment({ statisticsId, initialComment }: StatsCommentProps) {
	const [localComment, setLocalComment] = React.useState(initialComment ?? '');
	const [saveError, setSaveError] = React.useState<string | null>(null);
	const [isSaving, setIsSaving] = React.useState(false);
	const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingSaveRef = React.useRef<string | null>(null);
	const updatePeriodComment = useSetAtom(updatePeriodCommentAtom);

	const doSave = React.useCallback(
		async (comment: string) => {
			setIsSaving(true);
			setSaveError(null);
			try {
				await updatePeriodComment({
					statisticsId,
					comment: comment === '' ? null : comment,
				});
				setIsSaving(false);
				pendingSaveRef.current = null;
			} catch {
				setIsSaving(false);
				setSaveError('Не удалось сохранить');
			}
		},
		[statisticsId, updatePeriodComment],
	);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setLocalComment(value);
		pendingSaveRef.current = value;

		if (debounceRef.current !== null) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			void doSave(value);
		}, 700);
	};

	React.useEffect(() => {
		return () => {
			if (debounceRef.current !== null) {
				clearTimeout(debounceRef.current);
			}
			if (pendingSaveRef.current !== null) {
				void doSave(pendingSaveRef.current);
			}
		};
	}, [doSave]);

	return (
		<div className="space-y-1.5">
			<Textarea
				value={localComment}
				onChange={handleChange}
				placeholder="Добавить комментарий к периоду..."
				rows={3}
			/>
			{isSaving && (
				<p className="text-xs text-muted-foreground">Сохранение...</p>
			)}
			{saveError && (
				<p className="text-xs text-destructive">{saveError}</p>
			)}
		</div>
	);
}
