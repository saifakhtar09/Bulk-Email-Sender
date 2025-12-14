import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(toast: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: Toast = { ...toast, id };
		
		update(toasts => [...toasts, newToast]);
		
		const duration = toast.duration ?? 5000;
		if (duration > 0) {
			setTimeout(() => remove(id), duration);
		}
		
		return id;
	}

	function remove(id: string) {
		update(toasts => toasts.filter(t => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string) => add({ type: 'success', message }),
		error: (message: string) => add({ type: 'error', message }),
		info: (message: string) => add({ type: 'info', message }),
		warning: (message: string) => add({ type: 'warning', message }),
		remove
	};
}

export const toasts = createToastStore();
