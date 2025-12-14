import { apiClient } from './client';
import type { SmtpConfig, SmtpConfigInput } from '$lib/types';

export async function getConfigs() {
	return apiClient<any>('/config/smtp');
}

export async function createConfig(data: SmtpConfigInput) {
	return apiClient<any>('/config/smtp', {
		method: 'POST',
		body: JSON.stringify({
			name: data.name,
			host: data.host,
			port: data.port,
			secure: data.secure || false,
			user: data.user,
			pass: data.pass,
			fromEmail: data.from_email,
			fromName: data.from_name,
			isDefault: false
		})
	});
}

export async function updateConfig(configId: string, data: SmtpConfigInput) {
	return apiClient<any>(`/config/smtp/${configId}`, {
		method: 'PUT',
		body: JSON.stringify({
			name: data.name,
			host: data.host,
			port: data.port,
			secure: data.secure || false,
			user: data.user,
			pass: data.pass,
			fromEmail: data.from_email,
			fromName: data.from_name
		})
	});
}

export async function deleteConfig(configId: string) {
	return apiClient<any>(`/config/smtp/${configId}`, {
		method: 'DELETE'
	});
}

export async function setDefaultConfig(configId: string) {
	return apiClient<any>(`/config/smtp/${configId}/default`, {
		method: 'POST'
	});
}

export async function testConfig(data: SmtpConfigInput) {
	return apiClient<any>('/config/smtp/test', {
		method: 'POST',
		body: JSON.stringify({
			host: data.host,
			port: data.port,
			secure: data.secure || false,
			user: data.user,
			pass: data.pass
		})
	});
}