<script lang="ts">
	import { register } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/notifications';
	import { registerSchema } from '$lib/types';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/shared/Spinner.svelte';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let isLoading = false;
	let errors: Record<string, string> = {};

	async function handleSubmit() {
		errors = {};
		
		const result = registerSchema.safeParse({ name, email, password, confirmPassword });
		if (!result.success) {
			result.error.errors.forEach(err => {
				errors[err.path[0]] = err.message;
			});
			return;
		}

		isLoading = true;
		try {
			const response = await register({ name, email, password });
			if (response.success && response.user) {
				authStore.setUser(response.user);
				toasts.success('Account created successfully!');
				goto('/');
			} else {
				toasts.error(response.message || 'Registration failed');
			}
		} catch (err) {
			toasts.error(err instanceof Error ? err.message : 'Registration failed');
		} finally {
			isLoading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label for="name" class="label">Full Name</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
			<input
				type="text"
				id="name"
				bind:value={name}
				class="input pl-10"
				class:border-red-500={errors.name}
				placeholder="Full Name"
				autocomplete="name"
			/>
		</div>
		{#if errors.name}
			<p class="text-red-500 text-sm mt-1">{errors.name}</p>
		{/if}
	</div>

	<div>
		<label for="reg-email" class="label">Email Address</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
			<input
				type="email"
				id="reg-email"
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
		<label for="reg-password" class="label">Password</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
			<input
				type="password"
				id="reg-password"
				bind:value={password}
				class="input pl-10"
				class:border-red-500={errors.password}
				placeholder="Password (min 6 characters)"
				autocomplete="new-password"
			/>
		</div>
		{#if errors.password}
			<p class="text-red-500 text-sm mt-1">{errors.password}</p>
		{/if}
	</div>

	<div>
		<label for="confirm-password" class="label">Confirm Password</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
			<input
				type="password"
				id="confirm-password"
				bind:value={confirmPassword}
				class="input pl-10"
				class:border-red-500={errors.confirmPassword}
				placeholder="Confirm Password"
				autocomplete="new-password"
			/>
		</div>
		{#if errors.confirmPassword}
			<p class="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
		{/if}
	</div>

	<button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" disabled={isLoading}>
		{#if isLoading}
			<Spinner size="sm" />
		{:else}
			<span>✓</span>
		{/if}
		Create Account
	</button>
</form>
