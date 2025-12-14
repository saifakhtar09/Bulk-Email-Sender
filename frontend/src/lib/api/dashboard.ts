import { apiClient } from './client';
import type { DashboardData } from '$lib/types';

interface PollStatusResponse {
	shouldPoll: boolean;
	hasActiveBatch: boolean;
	hasScheduledJobs: boolean;
	recommendedInterval: number;
}

export async function getPollStatus(): Promise<PollStatusResponse> {
	return apiClient<PollStatusResponse>('/dashboard/poll-status');
}

export async function getDashboardData(): Promise<DashboardData> {
	return apiClient<DashboardData>('/dashboard/data');
}

// Combined fetch that reduces API calls
export async function getDashboardStatus(): Promise<{
	pollStatus: PollStatusResponse;
	data: DashboardData;
}> {
	const [pollStatus, data] = await Promise.all([
		getPollStatus(),
		getDashboardData()
	]);
	return { pollStatus, data };
}

// Refresh only if polling is needed
export async function getActiveBatchStatus() {
	const status = await getPollStatus();
	if (status.hasActiveBatch) {
		return getDashboardData();
	}
	return null;
}