import { apiClient } from './client';
import type { EmailLog, ReportStats } from '$lib/types';

interface ReportResponse {
	success: boolean;
	logs: EmailLog[];
	stats: ReportStats;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function getReports(page = 1, limit = 20): Promise<ReportResponse> {
	return apiClient<ReportResponse>(`/report?page=${page}&limit=${limit}`);
}

export async function exportReports(format: 'csv' | 'json'): Promise<Blob> {
	const response = await fetch(`/api/report/export/${format}`, {
		credentials: 'include'
	});
	if (!response.ok) throw new Error('Export failed');
	return response.blob();
}

export async function clearReports(): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>('/report/clear', { method: 'DELETE' });
}
