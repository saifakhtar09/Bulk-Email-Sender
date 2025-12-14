import { apiClient, apiFormData } from './client';
import type { BatchStatus, Contact } from '$lib/types';

interface SendEmailData {
	configId: string;
	subject: string;
	htmlContent: string;
	excelFile?: File;
	htmlTemplate?: File;
	useBatch: boolean;
	batchSize?: number;
	batchDelay?: number;
	emailDelay?: number;
	scheduleEmail: boolean;
	scheduledTime?: string;
	notifyEmail?: string;
	notifyBrowser: boolean;
	emailRangeStart?: number;
	emailRangeCount?: number;
}

export async function sendEmails(data: SendEmailData): Promise<{ success: boolean; message: string }> {
	const formData = new FormData();
	
	formData.append('configId', data.configId.toString());
	formData.append('subject', data.subject);
	formData.append('htmlContent', data.htmlContent);
	formData.append('useBatch', data.useBatch.toString());
	formData.append('scheduleEmail', data.scheduleEmail.toString());
	formData.append('notifyBrowser', data.notifyBrowser.toString());
	
	if (data.excelFile) formData.append('excelFile', data.excelFile);
	if (data.htmlTemplate) formData.append('htmlTemplate', data.htmlTemplate);
	if (data.batchSize) formData.append('batchSize', data.batchSize.toString());
	if (data.batchDelay) formData.append('batchDelay', data.batchDelay.toString());
	if (data.emailDelay) formData.append('emailDelay', data.emailDelay.toString());
	if (data.scheduledTime) formData.append('scheduledTime', data.scheduledTime);
	if (data.notifyEmail) formData.append('notifyEmail', data.notifyEmail);
	if (data.emailRangeStart) formData.append('emailRangeStart', data.emailRangeStart.toString());
	if (data.emailRangeCount) formData.append('emailRangeCount', data.emailRangeCount.toString());
	
	return apiFormData('/send', formData);
}

export async function parseExcel(file: File): Promise<{ success: boolean; contacts: Contact[]; columns: string[] }> {
	const formData = new FormData();
	formData.append('excelFile', file);
	return apiFormData('/parse-excel', formData);
}

export async function getBatchStatus(): Promise<BatchStatus> {
	return apiClient<BatchStatus>('/batch-status');
}

export async function pauseBatch(): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>('/batch-pause', { method: 'POST' });
}

export async function resumeBatch(): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>('/batch-resume', { method: 'POST' });
}

export async function cancelBatch(): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>('/batch-cancel', { method: 'DELETE' });
}

export async function getScheduledJobs(): Promise<{ success: boolean; jobs: import('$lib/types').ScheduledJob[] }> {
	return apiClient('/scheduled-jobs');
}

export async function cancelScheduledJob(id: string): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>(`/scheduled-jobs/${id}`, { method: 'DELETE' });
}