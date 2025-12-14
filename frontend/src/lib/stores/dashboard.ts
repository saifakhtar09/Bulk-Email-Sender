import { writable, get } from 'svelte/store';
import type { BatchStatus, ScheduledJob, ActivityItem } from '$lib/types';
import { getPollStatus, getDashboardData } from '$lib/api/dashboard';

interface DashboardState {
	batchStatus: BatchStatus | null;
	scheduledJobs: ScheduledJob[];
	recentActivity: ActivityItem[];
	isPolling: boolean;
	lastUpdate: Date | null;
}

function createDashboardStore() {
	const { subscribe, set, update } = writable<DashboardState>({
		batchStatus: null,
		scheduledJobs: [],
		recentActivity: [],
		isPolling: false,
		lastUpdate: null
	});

	let pollInterval: ReturnType<typeof setInterval> | null = null;

	async function checkAndPoll() {
		try {
			const status = await getPollStatus();
			
			if (status.shouldPoll) {
				const data = await getDashboardData();
				update(state => ({
					...state,
					batchStatus: data.batchStatus,
					scheduledJobs: data.scheduledJobs,
					recentActivity: data.recentActivity || [],
					lastUpdate: new Date()
				}));
			}
			
			return status.recommendedInterval || 10000;
		} catch {
			return 30000;
		}
	}

	return {
		subscribe,
		startPolling: async () => {
			if (pollInterval) return;
			
			update(state => ({ ...state, isPolling: true }));
			
			const poll = async () => {
				const interval = await checkAndPoll();
				if (get({ subscribe }).isPolling) {
					pollInterval = setTimeout(poll, interval);
				}
			};
			
			await poll();
		},
		stopPolling: () => {
			if (pollInterval) {
				clearTimeout(pollInterval);
				pollInterval = null;
			}
			update(state => ({ ...state, isPolling: false }));
		},
		refresh: async () => {
			await checkAndPoll();
		},
		setBatchStatus: (status: BatchStatus | null) => {
			update(state => ({ ...state, batchStatus: status }));
		}
	};
}

export const dashboardStore = createDashboardStore();
