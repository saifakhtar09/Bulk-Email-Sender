<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { logout } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/notifications';

	// Correct imports from heroicons-svelte
	import { ChartBarIcon, EnvelopeIcon, Cog6ToothIcon, ChartPieIcon } from 'heroicons-svelte/24/outline';

	let isMenuOpen = false;

	async function handleLogout() {
		try {
			await logout();
			authStore.logout();
			goto('/login');
		} catch {
			toasts.error('Logout failed');
		}
	}

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: ChartBarIcon },
		{ href: '/compose', label: 'Compose', icon: EnvelopeIcon },
		{ href: '/configs', label: 'SMTP', icon: Cog6ToothIcon },
		{ href: '/reports', label: 'Reports', icon: ChartPieIcon }
	];
</script>

<nav class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center gap-8">
				<a href="/" class="text-white font-bold text-xl">Email Sender</a>
				<div class="hidden md:flex gap-2">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
						>
							<svelte:component this={item.icon} class="w-5 h-5" />
							<span>{item.label}</span>
						</a>
					{/each}
				</div>
			</div>

			<div class="flex items-center gap-4">
				{#if $authStore.user}
					<span class="hidden sm:block">{$authStore.user.name}</span>
					<button
						class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
						on:click={handleLogout}
					>
						Logout
					</button>
				{/if}

				<button class="md:hidden" on:click={() => isMenuOpen = !isMenuOpen}>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>

		{#if isMenuOpen}
			<div class="md:hidden pb-4 flex flex-col gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
						on:click={() => isMenuOpen = false}
					>
						<svelte:component this={item.icon} class="w-5 h-5" />
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>
