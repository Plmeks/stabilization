const AUTH_KEY = 'auth_token';
const ONE_HOUR_MS = 3_600_000;

interface AuthToken {
	token: string;
	expiresAt?: number | null;
}

function parseStoredToken(raw: string | null): AuthToken | null {
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthToken;
	} catch {
		return null;
	}
}

export function isAuthenticated(): boolean {
	if (typeof window === 'undefined') return false;

	const localRaw = localStorage.getItem(AUTH_KEY);
	if (localRaw) {
		const data = parseStoredToken(localRaw);
		if (data?.token) return true;
	}

	const sessionRaw = sessionStorage.getItem(AUTH_KEY);
	if (sessionRaw) {
		const data = parseStoredToken(sessionRaw);
		if (data?.token) {
			if (data.expiresAt && Date.now() > data.expiresAt) {
				sessionStorage.removeItem(AUTH_KEY);
				return false;
			}
			return true;
		}
	}

	return false;
}

export function login(username: string, password: string, rememberMe: boolean): boolean {
	const envUser = process.env.NEXT_PUBLIC_AUTH_USERNAME;
	const envPass = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

	if (username === envUser && password === envPass) {
		if (rememberMe) {
			const data: AuthToken = { token: 'authenticated' };
			localStorage.setItem(AUTH_KEY, JSON.stringify(data));
		} else {
			const data: AuthToken = { token: 'authenticated', expiresAt: Date.now() + ONE_HOUR_MS };
			sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
		}
		return true;
	}
	return false;
}

export function logout(): void {
	localStorage.removeItem(AUTH_KEY);
	sessionStorage.removeItem(AUTH_KEY);
}
