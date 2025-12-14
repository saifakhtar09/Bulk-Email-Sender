import { apiClient } from './client';
import type { User, LoginInput, RegisterInput } from '$lib/types';

interface AuthResponse {
	success: boolean;
	message?: string;
	user?: User;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
	return apiClient<AuthResponse>('/auth/login', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function register(data: Omit<RegisterInput, 'confirmPassword'>): Promise<AuthResponse> {
	return apiClient<AuthResponse>('/auth/register', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function logout(): Promise<AuthResponse> {
	return apiClient<AuthResponse>('/auth/logout', {
		method: 'POST'
	});
}

export async function getCurrentUser(): Promise<{ success: boolean; user?: User }> {
	return apiClient<{ success: boolean; user?: User }>('/user/info');
}
