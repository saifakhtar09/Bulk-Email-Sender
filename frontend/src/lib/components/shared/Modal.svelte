<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	export let open = false;
	export let title = '';
	export let onClose: () => void = () => {};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="absolute inset-0 bg-black/50"
			on:click={onClose}
			on:keypress={() => {}}
			role="button"
			tabindex="-1"
		></div>
		<div
			class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto"
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			{#if title}
				<div class="flex items-center justify-between p-6 border-b">
					<h2 class="text-xl font-semibold text-gray-800">{title}</h2>
					<button
						class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
						on:click={onClose}
					>
						&times;
					</button>
				</div>
			{/if}
			<div class="p-6">
				<slot />
			</div>
		</div>
	</div>
{/if}
