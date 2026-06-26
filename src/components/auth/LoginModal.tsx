'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/layout/Logo';
import { StabilityRibbon } from '@/components/shared/StabilityRibbon';
import { login } from '@/lib/auth';

interface LoginModalProps {
	onSuccess: () => void;
}

export default function LoginModal({ onSuccess }: LoginModalProps) {
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [rememberMe, setRememberMe] = React.useState(false);
	const [error, setError] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		const success = login(username, password, rememberMe);
		setIsLoading(false);

		if (success) {
			onSuccess();
		} else {
			setError('Неверный логин или пароль');
		}
	}

	return (
		<Dialog open modal>
			<DialogContent
				showCloseButton={false}
				className="overflow-hidden p-0 sm:max-w-sm"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<StabilityRibbon />
				<div className="flex flex-col gap-5 p-6">
					<DialogHeader className="items-center gap-3 text-center">
						<Logo size={48} />
						<div className="flex flex-col gap-1">
							<DialogTitle className="text-lg">Вход в Stabana</DialogTitle>
							<span className="eyebrow">Команда Видеозвонки</span>
						</div>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="username">Логин</Label>
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							autoComplete="username"
							required
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="password">Пароль</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
							required
						/>
					</div>
					<div className="flex items-center gap-2">
						<input
							id="remember-me"
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
						/>
						<Label htmlFor="remember-me" className="cursor-pointer font-normal">
							Запомнить на этом устройстве
						</Label>
					</div>
					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}
					<Button type="submit" disabled={isLoading} className="mt-1">
						{isLoading ? 'Вход...' : 'Войти'}
					</Button>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
