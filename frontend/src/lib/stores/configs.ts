import { writable } from 'svelte/store';
import type { SmtpConfig } from '$lib/types';

interface ConfigsState {
	configs: SmtpConfig[];
	selectedConfig: SmtpConfig | null;
	isLoading: boolean;
}

function createConfigsStore() {
	const { subscribe, set, update } = writable<ConfigsState>({
		configs: [],
		selectedConfig: null,
		isLoading: false
	});

	return {
		subscribe,
		setConfigs: (configs: SmtpConfig[]) => {
			update(state => {
				const defaultConfig = configs.find(c => c.is_default) || configs[0] || null;
				return {
					...state,
					configs,
					selectedConfig: state.selectedConfig || defaultConfig
				};
			});
		},
		selectConfig: (config: SmtpConfig | null) => {
			update(state => ({ ...state, selectedConfig: config }));
		},
		setLoading: (loading: boolean) => {
			update(state => ({ ...state, isLoading: loading }));
		},
		addConfig: (config: SmtpConfig) => {
			update(state => ({
				...state,
				configs: [...state.configs, config]
			}));
		},
		updateConfig: (id: string, config: SmtpConfig) => {
			update(state => ({
				...state,
				configs: state.configs.map(c => c.id === id ? config : c),
				selectedConfig: state.selectedConfig?.id === id ? config : state.selectedConfig
			}));
		},
		removeConfig: (id: string) => {
			update(state => ({
				...state,
				configs: state.configs.filter(c => c.id !== id),
				selectedConfig: state.selectedConfig?.id === id ? null : state.selectedConfig
			}));
		}
	};
}

export const configsStore = createConfigsStore();