<script lang="ts">
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/notifications';
	import { loginSchema } from '$lib/types';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/shared/Spinner.svelte';

	let email = '';
	let password = '';
	let isLoading = false;
	let errors: Record<string, string> = {};

	async function handleSubmit() {
		errors = {};
		
		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			result.error.errors.forEach(err => {
				errors[err.path[0]] = err.message;
			});
			return;
		}

		isLoading = true;
		try {
			const response = await login({ email, password });
			if (response.success && response.user) {
				authStore.setUser(response.user);
				toasts.success('Welcome back!');
				goto('/');
			} else {
				toasts.error(response.message || 'Login failed');
			}
		} catch (err) {
			toasts.error(err instanceof Error ? err.message : 'Login failed');
		} finally {
			isLoading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label for="email" class="label">Email Address</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="input pl-10"
				class:border-red-500={errors.email}
				placeholder="Email Address"
				autocomplete="email"
			/>
		</div>
		{#if errors.email}
			<p class="text-red-500 text-sm mt-1">{errors.email}</p>
		{/if}
	</div>

	<div>
		<label for="password" class="label">Password</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
			<input
				type="password"
				id="password"
				bind:value={password}
				class="input pl-10"
				class:border-red-500={errors.password}
				placeholder="Password"
				autocomplete="current-password"
			/>
		</div>
		{#if errors.password}
			<p class="text-red-500 text-sm mt-1">{errors.password}</p>
		{/if}
	</div>

	<button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" disabled={isLoading}>
		{#if isLoading}
			<Spinner size="sm" />
		{:else}
			<span>➜</span>
		{/if}
		Sign In
	</button>
</form>
