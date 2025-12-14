<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dashboardStore } from '$lib/stores/dashboard';
	import Spinner from '$lib/components/shared/Spinner.svelte';
	import { cancelBatch, pauseBatch, resumeBatch, cancelScheduledJob } from '$lib/api/emails';
	import { toasts } from '$lib/stores/notifications';

	// Heroicons imports
	import { EnvelopeIcon, Cog6ToothIcon, ChartBarIcon, ArrowPathIcon } from 'heroicons-svelte/24/outline';

	onMount(() => {
		dashboardStore.startPolling();
	});

	onDestroy(() => {
		dashboardStore.stopPolling();
	});

	async function handlePause() {
		try {
			await pauseBatch();
			toasts.success('Batch paused');
			dashboardStore.refresh();
		} catch {
			toasts.error('Failed to pause batch');
		}
	}

	async function handleResume() {
		try {
			await resumeBatch();
			toasts.success('Batch resumed');
			dashboardStore.refresh();
		} catch {
			toasts.error('Failed to resume batch');
		}
	}

	async function handleCancel() {
		if (!confirm('Are you sure you want to cancel the current batch?')) return;
		try {
			await cancelBatch();
			toasts.success('Batch cancelled');
			dashboardStore.refresh();
		} catch {
			toasts.error('Failed to cancel batch');
		}
	}

	async function handleCancelScheduled(id: string) {
		if (!confirm('Are you sure you want to cancel this scheduled job?')) return;
		try {
			await cancelScheduledJob(id);
			toasts.success('Scheduled job cancelled');
			dashboardStore.refresh();
		} catch {
			toasts.error('Failed to cancel scheduled job');
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Email Sender</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Dashboard</h1>
		<a href="/compose" class="btn-primary flex items-center gap-2">
			<EnvelopeIcon class="w-5 h-5" />
			Compose Email
		</a>
	</div>

	<!-- Grid -->
	<div class="grid md:grid-cols-2 gap-6">
		<!-- Batch Status -->
		<div class="card">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Batch Status</h2>
			{#if $dashboardStore.batchStatus?.isProcessing}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">
							{$dashboardStore.batchStatus.isPaused ? 'Paused' : 'Processing'}
						</span>
						<span class="text-sm font-medium">
							{$dashboardStore.batchStatus.progress.current} / {$dashboardStore.batchStatus.progress.total}
						</span>
					</div>
					
					<div class="w-full bg-gray-200 rounded-full h-3">
						<div 
							class="h-3 rounded-full transition-all duration-300"
							class:bg-purple-600={!$dashboardStore.batchStatus.isPaused}
							class:bg-yellow-500={$dashboardStore.batchStatus.isPaused}
							style="width: {($dashboardStore.batchStatus.progress.current / $dashboardStore.batchStatus.progress.total) * 100}%"
						></div>
					</div>

					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-gray-500">Successful:</span>
							<span class="text-green-600 font-medium ml-1">{$dashboardStore.batchStatus.stats.successful}</span>
						</div>
						<div>
							<span class="text-gray-500">Failed:</span>
							<span class="text-red-600 font-medium ml-1">{$dashboardStore.batchStatus.stats.failed}</span>
						</div>
					</div>

					<div class="flex gap-2">
						{#if $dashboardStore.batchStatus.isPaused}
							<button class="btn-success text-sm flex items-center gap-1" on:click={handleResume}>
								<ArrowPathIcon class="w-4 h-4" />
								Resume
							</button>
						{:else}
							<button class="btn-secondary text-sm" on:click={handlePause}>Pause</button>
						{/if}
						<button class="btn-danger text-sm">Cancel</button>
					</div>
				</div>
			{:else}
				<p class="text-gray-500">No active batch jobs</p>
			{/if}
		</div>

		<!-- Scheduled Jobs -->
		<div class="card">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Scheduled Jobs</h2>
			{#if $dashboardStore.scheduledJobs.length > 0}
				<div class="space-y-3">
					{#each $dashboardStore.scheduledJobs as job}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div>
								<p class="font-medium text-gray-800">{job.subject}</p>
								<p class="text-sm text-gray-500">
									{new Date(job.scheduledTime).toLocaleString()} - {job.totalRecipients} recipients
								</p>
							</div>
							<button 
								class="text-red-500 hover:text-red-700"
								on:click={() => handleCancelScheduled(job.id)}
							>
								Cancel
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No scheduled jobs</p>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="card">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<a href="/compose" class="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors flex flex-col items-center gap-2">
				<EnvelopeIcon class="w-6 h-6 text-purple-700"/>
				<div class="font-medium text-purple-700">Compose</div>
			</a>
			<a href="/configs" class="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors flex flex-col items-center gap-2">
				<Cog6ToothIcon class="w-6 h-6 text-blue-700"/>
				<div class="font-medium text-blue-700">SMTP Settings</div>
			</a>
			<a href="/reports" class="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors flex flex-col items-center gap-2">
				<ChartBarIcon class="w-6 h-6 text-green-700"/>
				<div class="font-medium text-green-700">Reports</div>
			</a>
			<button 
				class="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
				on:click={() => dashboardStore.refresh()}
			>
				<ArrowPathIcon class="w-6 h-6 text-gray-700"/>
				<div class="font-medium text-gray-700">Refresh</div>
			</button>
		</div>
	</div>
</div>
