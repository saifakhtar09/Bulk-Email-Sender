<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { getCurrentUser } from '$lib/api/auth';
	import Toast from '$lib/components/shared/Toast.svelte';
	import Navbar from '$lib/components/shared/Navbar.svelte';
	import Spinner from '$lib/components/shared/Spinner.svelte';

	const publicRoutes = ['/login'];

	onMount(async () => {
		try {
			const response = await getCurrentUser();
			if (response.success && response.user) {
				authStore.setUser(response.user);
			} else {
				authStore.setUser(null);
			}
		} catch {
			authStore.setUser(null);
		}
	});

	$: if (!$authStore.isLoading && !$authStore.isAuthenticated && !publicRoutes.includes($page.url.pathname)) {
		goto('/login');
	}

	$: if (!$authStore.isLoading && $authStore.isAuthenticated && $page.url.pathname === '/login') {
		goto('/');
	}

	$: isPublicRoute = publicRoutes.includes($page.url.pathname);
</script>

<Toast />

{#if $authStore.isLoading}
	<div class="min-h-screen flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else if isPublicRoute}
	<slot />
{:else if $authStore.isAuthenticated}
	<div class="min-h-screen">
		<Navbar />
		<main class="max-w-7xl mx-auto px-4 py-8">
			<slot />
		</main>
	</div>
{/if}