'use client';

import * as React from 'react';
import { isAuthenticated } from '@/lib/auth';
import LoginModal from './LoginModal';

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	// Tracks a successful login within this session
	const [authOverride, setAuthOverride] = React.useState<boolean | null>(null);

	// useSyncExternalStore lets React know the server and client snapshots intentionally
	// differ, preventing hydration errors without any useEffect setState calls.
	const storeIsAuth = React.useSyncExternalStore(
		() => () => {},          // no external subscription needed
		() => isAuthenticated(),  // client snapshot
		() => false,              // server snapshot — always unauthenticated on server
	);

	const isAuth = authOverride !== null ? authOverride : storeIsAuth;

	if (!isAuth) {
		return <LoginModal onSuccess={() => setAuthOverride(true)} />;
	}

	return <>{children}</>;
}
