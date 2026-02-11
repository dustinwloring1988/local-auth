import { App, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export const api = {
    getApps: () => request<{ apps: App[] }>('/api/apps'),

    getApp: (id: string) => request<{ app: App }>(`/api/apps/${id}`),

    createApp: (data: { name: string; description: string }) =>
        request<{ app: App }>('/api/apps', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteApp: (id: string) =>
        request<{ success: boolean }>(`/api/apps/${id}`, { method: 'DELETE' }),

    getUsers: (appId: string) =>
        request<{ users: User[] }>(`/api/apps/${appId}/users`),

    deleteUser: (appId: string, userId: string) =>
        request<{ success: boolean }>(`/api/apps/${appId}/users/${userId}`, {
            method: 'DELETE',
        }),
};
