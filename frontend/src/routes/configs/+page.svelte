<script lang="ts">
	import { onMount } from 'svelte';
	import { configsStore } from '$lib/stores/configs';
	import { getConfigs, createConfig, updateConfig, deleteConfig, setDefaultConfig, testConfig } from '$lib/api/configs';
	import { toasts } from '$lib/stores/notifications';
	import { smtpConfigSchema, type SmtpConfig, type SmtpConfigInput } from '$lib/types';
	import Modal from '$lib/components/shared/Modal.svelte';
	import Spinner from '$lib/components/shared/Spinner.svelte';

	let isLoading = true;
	let showModal = false;
	let editingConfig: SmtpConfig | null = null;
	let isSaving = false;
	let isTesting = false;

	let formData: SmtpConfigInput = {
		name: '',
		host: '',
		port: 587,
		secure: false,
		user: '',
		pass: '',
		from_email: '',
		from_name: ''
	};
	let errors: Record<string, string> = {};

	onMount(async () => {
		await loadConfigs();
	});

	async function loadConfigs() {
		isLoading = true;
		try {
			const response = await getConfigs();
			if (response.success && response.configs) {
				configsStore.setConfigs(response.configs);
			}
		} catch {
			toasts.error('Failed to load configurations');
		} finally {
			isLoading = false;
		}
	}

	function openModal(config?: SmtpConfig) {
		editingConfig = config || null;
		if (config) {
			formData = {
				name: config.name,
				host: config.host,
				port: config.port,
				secure: config.secure,
				user: config.user,
				pass: config.pass,
				from_email: config.from_email,
				from_name: config.from_name
			};
		} else {
			formData = {
				name: '',
				host: '',
				port: 587,
				secure: false,
				user: '',
				pass: '',
				from_email: '',
				from_name: ''
			};
		}
		errors = {};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingConfig = null;
	}

	async function handleSubmit() {
		errors = {};
		const result = smtpConfigSchema.safeParse(formData);
		if (!result.success) {
			result.error.errors.forEach(err => {
				errors[err.path[0]] = err.message;
			});
			return;
		}

		isSaving = true;
		try {
			if (editingConfig) {
				const response = await updateConfig(editingConfig.id, formData);
				if (response.success) {
					toasts.success('Configuration updated');
					await loadConfigs();
					closeModal();
				}
			} else {
				const response = await createConfig(formData);
				if (response.success) {
					toasts.success('Configuration created');
					await loadConfigs();
					closeModal();
				}
			}
		} catch (err) {
			toasts.error(err instanceof Error ? err.message : 'Failed to save configuration');
		} finally {
			isSaving = false;
		}
	}

	async function handleTest() {
		const result = smtpConfigSchema.safeParse(formData);
		if (!result.success) {
			toasts.error('Please fill in all fields correctly');
			return;
		}

		isTesting = true;
		try {
			const response = await testConfig(formData);
			if (response.success) {
				toasts.success('✅ Connection successful!');
			} else {
				toasts.error(response.message || 'Connection failed');
			}
		} catch (err) {
			toasts.error(err instanceof Error ? err.message : 'Connection test failed');
		} finally {
			isTesting = false;
		}
	}

	async function handleDelete(config: SmtpConfig) {
		if (!confirm(`Delete "${config.name}"?`)) return;
		try {
			await deleteConfig(config.id);
			toasts.success('Configuration deleted');
			await loadConfigs();
		} catch {
			toasts.error('Failed to delete configuration');
		}
	}

	async function handleSetDefault(config: SmtpConfig) {
		try {
			await setDefaultConfig(config.id);
			toasts.success('Default configuration updated');
			await loadConfigs();
		} catch {
			toasts.error('Failed to set default');
		}
	}

	function prefillGmail() {
		formData.host = 'smtp.gmail.com';
		formData.port = 587;
		formData.secure = false;
	}
</script>

<svelte:head>
	<title>SMTP Configurations - Email Sender</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">SMTP Configurations</h1>
		<button class="btn-primary" on:click={() => openModal()}>
			Add Configuration
		</button>
	</div>

	{#if isLoading}
		<div class="card flex justify-center py-12">
			<Spinner size="lg" />
		</div>
	{:else if $configsStore.configs.length === 0}
		<div class="card text-center py-12">
			<p class="text-gray-500 mb-4">No SMTP configurations yet</p>
			<button class="btn-primary" on:click={() => openModal()}>
				Add Your First Configuration
			</button>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each $configsStore.configs as config}
				<div class="card flex items-center justify-between">
					<div class="flex items-center gap-4">
						{#if config.is_default}
							<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Default</span>
						{/if}
						<div>
							<h3 class="font-semibold text-gray-800">{config.name}</h3>
							<p class="text-sm text-gray-500">
								{config.host}:{config.port} - {config.from_email}
							</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						{#if !config.is_default}
							<button 
								class="text-sm text-purple-600 hover:text-purple-800"
								on:click={() => handleSetDefault(config)}
							>
								Set Default
							</button>
						{/if}
						<button 
							class="text-sm text-blue-600 hover:text-blue-800"
							on:click={() => openModal(config)}
						>
							Edit
						</button>
						<button 
							class="text-sm text-red-600 hover:text-red-800"
							on:click={() => handleDelete(config)}
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showModal} title={editingConfig ? 'Edit Configuration' : 'Add Configuration'} onClose={closeModal}>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="name" class="label">Configuration Name</label>
			<input type="text" id="name" bind:value={formData.name} class="input" placeholder="My Gmail" />
			{#if errors.name}<p class="text-red-500 text-sm mt-1">{errors.name}</p>{/if}
		</div>

		<div class="flex gap-2">
			<button type="button" class="btn-secondary text-sm" on:click={prefillGmail}>Gmail Settings</button>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="host" class="label">SMTP Host</label>
				<input type="text" id="host" bind:value={formData.host} class="input" placeholder="smtp.gmail.com" />
				{#if errors.host}<p class="text-red-500 text-sm mt-1">{errors.host}</p>{/if}
			</div>
			<div>
				<label for="port" class="label">Port</label>
				<input type="number" id="port" bind:value={formData.port} class="input" />
				{#if errors.port}<p class="text-red-500 text-sm mt-1">{errors.port}</p>{/if}
			</div>
		</div>

		<div>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={formData.secure} />
				<span class="label">Use SSL/TLS (Secure)</span>
			</label>
		</div>

		<div>
			<label for="user" class="label">Username</label>
			<input type="text" id="user" bind:value={formData.user} class="input" placeholder="your@gmail.com" />
			{#if errors.user}<p class="text-red-500 text-sm mt-1">{errors.user}</p>{/if}
		</div>

		<div>
			<label for="pass" class="label">Password / App Password</label>
			<input type="password" id="pass" bind:value={formData.pass} class="input" placeholder="16-character app password" />
			{#if errors.pass}<p class="text-red-500 text-sm mt-1">{errors.pass}</p>{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="from_email" class="label">From Email</label>
				<input type="email" id="from_email" bind:value={formData.from_email} class="input" />
				{#if errors.from_email}<p class="text-red-500 text-sm mt-1">{errors.from_email}</p>{/if}
			</div>
			<div>
				<label for="from_name" class="label">From Name</label>
				<input type="text" id="from_name" bind:value={formData.from_name} class="input" />
				{#if errors.from_name}<p class="text-red-500 text-sm mt-1">{errors.from_name}</p>{/if}
			</div>
		</div>

		<div class="flex gap-3 pt-4">
			<button type="button" class="btn-secondary flex-1" on:click={handleTest} disabled={isTesting}>
				{#if isTesting}<Spinner size="sm" />{:else}Test Connection{/if}
			</button>
			<button type="submit" class="btn-primary flex-1" disabled={isSaving}>
				{#if isSaving}<Spinner size="sm" />{:else}{editingConfig ? 'Update' : 'Create'}{/if}
			</button>
		</div>
	</form>
</Modal>