const API_BASE = '/api';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function apiClient<T>(
	url: string,
	options: RequestInit = {}
): Promise<T> {
	const response = await fetch(`${API_BASE}${url}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const text = await response.text();
		let message = text;
		try {
			const json = JSON.parse(text);
			message = json.message || json.error || text;
		} catch {
			// Use text as-is
		}
		throw new ApiError(response.status, message);
	}

	const contentType = response.headers.get('content-type');
	if (contentType?.includes('application/json')) {
		return response.json();
	}
	return response.text() as unknown as T;
}

export async function apiFormData<T>(
	url: string,
	formData: FormData
): Promise<T> {
	const response = await fetch(`${API_BASE}${url}`, {
		method: 'POST',
		credentials: 'include',
		body: formData
	});

	if (!response.ok) {
		const text = await response.text();
		let message = text;
		try {
			const json = JSON.parse(text);
			message = json.message || json.error || text;
		} catch {
			// Use text as-is
		}
		throw new ApiError(response.status, message);
	}

	return response.json();
}
