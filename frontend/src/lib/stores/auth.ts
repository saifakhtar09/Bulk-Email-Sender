import { writable } from 'svelte/store';
import type { User } from '$lib/types';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true
	});

	return {
		subscribe,
		setUser: (user: User | null) => {
			set({
				user,
				isAuthenticated: !!user,
				isLoading: false
			});
		},
		setLoading: (loading: boolean) => {
			update(state => ({ ...state, isLoading: loading }));
		},
		logout: () => {
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false
			});
		}
	};
}

export const authStore = createAuthStore();
