<script lang="ts">
	export let type: 'success' | 'error' | 'info' | 'warning' = 'info';

	const styles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
	};
</script>

<div class="p-4 rounded-lg border {styles[type]}">
	<slot />
</div>
