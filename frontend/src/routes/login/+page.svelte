<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';

	let activeTab: 'login' | 'register' = 'login';
</script>

<svelte:head>
	<title>Email Sender - Login</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="card max-w-md w-full">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
				Email Sender
			</h1>
			<p class="text-gray-500 mt-2">Secure bulk email management</p>
		</div>

		<div class="flex rounded-lg bg-gray-100 p-1 mb-6">
			<button
				class="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
				class:bg-gradient-to-r={activeTab === 'login'}
				class:from-purple-600={activeTab === 'login'}
				class:to-indigo-600={activeTab === 'login'}
				class:text-white={activeTab === 'login'}
				class:text-gray-600={activeTab !== 'login'}
				on:click={() => activeTab = 'login'}
			>
				Sign In
			</button>
			<button
				class="flex-1 py-2 px-4 rounded-lg font-medium transition-all"
				class:bg-gradient-to-r={activeTab === 'register'}
				class:from-purple-600={activeTab === 'register'}
				class:to-indigo-600={activeTab === 'register'}
				class:text-white={activeTab === 'register'}
				class:text-gray-600={activeTab !== 'register'}
				on:click={() => activeTab = 'register'}
			>
				Sign Up
			</button>
		</div>

		{#if activeTab === 'login'}
			<LoginForm />
		{:else}
			<RegisterForm />
		{/if}

		<p class="text-center text-gray-500 text-sm mt-6">
			Secure authentication with session management
		</p>
	</div>
</div>
