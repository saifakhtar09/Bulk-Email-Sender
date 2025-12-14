<script lang="ts">
	import { toasts } from '$lib/stores/notifications';
	import { fade, fly } from 'svelte/transition';

	const typeStyles = {
		success: 'bg-green-500',
		error: 'bg-red-500',
		info: 'bg-blue-500',
		warning: 'bg-yellow-500'
	};

	const typeIcons = {
		success: '✓',
		error: '✕',
		info: 'ℹ',
		warning: '⚠'
	};
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ x: 100, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="{typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]"
		>
			<span class="text-lg">{typeIcons[toast.type]}</span>
			<span class="flex-1">{toast.message}</span>
			<button
				class="text-white/80 hover:text-white"
				on:click={() => toasts.remove(toast.id)}
			>
				✕
			</button>
		</div>
	{/each}
</div>
