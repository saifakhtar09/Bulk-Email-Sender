<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};
</script>

<div class="{sizes[size]} animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
