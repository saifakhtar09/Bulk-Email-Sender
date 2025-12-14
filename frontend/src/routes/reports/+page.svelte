<script lang="ts">
	import { onMount } from 'svelte';
	import { getReports, exportReports, clearReports } from '$lib/api/reports';
	import { toasts } from '$lib/stores/notifications';
	import type { EmailLog, ReportStats } from '$lib/types';
	import Spinner from '$lib/components/shared/Spinner.svelte';

	let logs: EmailLog[] = [];
	let stats: ReportStats = { total: 0, sent: 0, failed: 0, successRate: 0 };
	let isLoading = true;
	let page = 1;
	let totalPages = 1;
	let searchQuery = '';
	let statusFilter = 'all';

	onMount(async () => {
		await loadReports();
	});

	async function loadReports() {
		isLoading = true;
		try {
			const response = await getReports(page);
			if (response.success) {
				logs = response.logs;
				stats = response.stats;
				totalPages = response.pagination.totalPages;
			}
		} catch {
			toasts.error('Failed to load reports');
		} finally {
			isLoading = false;
		}
	}

	async function handleExport(format: 'csv' | 'json') {
		try {
			const blob = await exportReports(format);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `email-report.${format}`;
			a.click();
			URL.revokeObjectURL(url);
			toasts.success(`Exported as ${format.toUpperCase()}`);
		} catch {
			toasts.error('Export failed');
		}
	}

	async function handleClear() {
		if (!confirm('Are you sure you want to clear all logs? This cannot be undone.')) return;
		try {
			await clearReports();
			toasts.success('Logs cleared');
			await loadReports();
		} catch {
			toasts.error('Failed to clear logs');
		}
	}

	$: filteredLogs = logs.filter(log => {
		const matchesSearch = searchQuery === '' || 
			log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.subject.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
		return matchesSearch && matchesStatus;
	});
</script>

<svelte:head>
	<title>Reports - Email Sender</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Reports</h1>
		<div class="flex gap-2">
			<button class="btn-secondary text-sm" on:click={() => handleExport('csv')}>Export CSV</button>
			<button class="btn-secondary text-sm" on:click={() => handleExport('json')}>Export JSON</button>
			<button class="btn-danger text-sm" on:click={handleClear}>Clear Logs</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="card text-center">
			<div class="text-3xl font-bold text-gray-800">{stats.total}</div>
			<div class="text-sm text-gray-500">Total Emails</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-green-600">{stats.sent}</div>
			<div class="text-sm text-gray-500">Sent</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-red-600">{stats.failed}</div>
			<div class="text-sm text-gray-500">Failed</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
			<div class="text-sm text-gray-500">Success Rate</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="card">
		<div class="flex flex-wrap gap-4">
			<div class="flex-1 min-w-[200px]">
				<input 
					type="text" 
					bind:value={searchQuery}
					placeholder="Search by email or subject..."
					class="input"
				/>
			</div>
			<select bind:value={statusFilter} class="input w-auto">
				<option value="all">All Status</option>
				<option value="sent">Sent</option>
				<option value="failed">Failed</option>
			</select>
			<button class="btn-secondary" on:click={loadReports}>
				Refresh
			</button>
		</div>
	</div>

	<!-- Logs Table -->
	<div class="card overflow-hidden">
		{#if isLoading}
			<div class="flex justify-center py-12">
				<Spinner size="lg" />
			</div>
		{:else if filteredLogs.length === 0}
			<p class="text-center text-gray-500 py-12">No email logs found</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Recipient</th>
							<th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Subject</th>
							<th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
							<th class="text-left px-4 py-3 text-sm font-medium text-gray-600">Sent At</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each filteredLogs as log}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3 text-sm text-gray-800">{log.recipient}</td>
								<td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{log.subject}</td>
								<td class="px-4 py-3">
									<span 
										class="text-xs px-2 py-1 rounded-full"
										class:bg-green-100={log.status === 'sent'}
										class:text-green-700={log.status === 'sent'}
										class:bg-red-100={log.status === 'failed'}
										class:text-red-700={log.status === 'failed'}
									>
										{log.status}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-gray-500">
									{new Date(log.sent_at).toLocaleString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-center gap-2 p-4 border-t">
					<button 
						class="btn-secondary text-sm"
						disabled={page === 1}
						on:click={() => { page--; loadReports(); }}
					>
						Previous
					</button>
					<span class="text-sm text-gray-600">Page {page} of {totalPages}</span>
					<button 
						class="btn-secondary text-sm"
						disabled={page === totalPages}
						on:click={() => { page++; loadReports(); }}
					>
						Next
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
