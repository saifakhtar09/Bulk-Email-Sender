import { z } from 'zod';

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface SmtpConfig {
	id: string;
	user_id: string;
	name: string;
	host: string;
	port: number;
	secure: boolean;
	user: string;
	pass: string;
	from_email: string;
	from_name: string;
	is_default: boolean;
	created_at: string;
	updated_at: string;
}

export interface BatchStatus {
	isProcessing: boolean;
	isPaused: boolean;
	progress: {
		current: number;
		total: number;
		batchNumber: number;
		totalBatches: number;
	};
	stats: {
		successful: number;
		failed: number;
		errors: string[];
	};
	timeInfo?: {
		startTime: string;
		elapsed: string;
		estimated: string;
	};
}

export interface ScheduledJob {
	id: string;
	scheduledTime: string;
	localTime?: string;
	status: string;
	subject: string;
	totalRecipients: number;
	config?: SmtpConfig;
	createdAt: string;
}

export interface DashboardData {
	batchStatus: BatchStatus;
	scheduledJobs: ScheduledJob[];
	recentActivity: ActivityItem[];
}

export interface ActivityItem {
	type: 'batch_start' | 'batch_complete' | 'schedule_created' | 'email_sent';
	message: string;
	timestamp: string;
}

export interface EmailLog {
	id: string;
	user_id: string;
	config_id: string;
	recipient: string;
	subject: string;
	status: 'sent' | 'failed';
	error_message?: string;
	sent_at: string;
}

export interface ReportStats {
	total: number;
	sent: number;
	failed: number;
	successRate: number;
}

export interface Contact {
	Email: string;
	FirstName?: string;
	LastName?: string;
	Company?: string;
	[key: string]: string | undefined;
}

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	name: z.string().min(2, 'Name must be at least 2 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword']
});

export const smtpConfigSchema = z.object({
	name: z.string().min(1, 'Configuration name is required'),
	host: z.string().min(1, 'SMTP host is required'),
	port: z.number().min(1).max(65535),
	secure: z.boolean().optional(),
	user: z.string().min(1, 'SMTP username is required'),
	pass: z.string().min(1, 'SMTP password is required'),
	from_email: z.string().email('Invalid email address'),
	from_name: z.string().min(1, 'From name is required')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SmtpConfigInput = z.infer<typeof smtpConfigSchema>;