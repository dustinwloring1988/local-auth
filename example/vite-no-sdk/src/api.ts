import { AuthResponse, SignupParams, SigninParams, UpdateParams, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_APP_API_KEY || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options?.headers,
    };

    const res = await fetch(`${API_URL}${path}`, {
        headers,
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json();
}

export const authApi = {
    signup: (data: SignupParams): Promise<AuthResponse> =>
        request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    signin: (data: SigninParams): Promise<AuthResponse> =>
        request('/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMe: (token: string): Promise<{ user: User }> =>
        request('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        }),

    updateMe: (token: string, data: UpdateParams): Promise<{ user: User }> =>
        request('/api/auth/me', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        }),

    signout: (): Promise<{ success: boolean }> =>
        request('/api/auth/signout', { method: 'POST' }),
};
