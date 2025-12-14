<script lang="ts">
        import { onMount } from 'svelte';
        import { configsStore } from '$lib/stores/configs';
        import { getConfigs } from '$lib/api/configs';
        import { sendEmails, parseExcel } from '$lib/api/emails';
        import { toasts } from '$lib/stores/notifications';
        import { goto } from '$app/navigation';
        import type { Contact } from '$lib/types';
        import Spinner from '$lib/components/shared/Spinner.svelte';
        import Alert from '$lib/components/shared/Alert.svelte';
        import EmailEditor from '$lib/components/compose/EmailEditor.svelte';

        let subject = '';
        let htmlContent = '';
        let emailEditor: EmailEditor;
        let excelFile: File | null = null;
        let htmlTemplate: File | null = null;
        let contacts: Contact[] = [];
        let columns: string[] = [];
        
        let rangeType: 'all' | 'first' | 'custom' = 'all';
        let rangeStart = 1;
        let rangeCount = 10;
        
        let useBatch = false;
        let batchSize = 50;
        let batchDelay = 60;
        let emailDelay = 1;
        
        let scheduleEmail = false;
        let scheduledTime = '';
        let notifyEmail = '';
        let notifyBrowser = false;
        
        let isSending = false;
        let isParsing = false;

        onMount(async () => {
                try {
                        const response = await getConfigs();
                        if (response.success && response.userConfigs) {
                                configsStore.setConfigs(response.userConfigs);
                        }
                } catch {
                        toasts.error('Failed to load SMTP configurations');
                }
        });

        async function handleExcelUpload(e: Event) {
                const input = e.target as HTMLInputElement;
                const file = input.files?.[0];
                if (!file) return;

                excelFile = file;
                isParsing = true;

                try {
                        const response = await parseExcel(file);
                        if (response.success && response.contacts && response.contacts.length > 0) {
                                contacts = response.contacts;
                                columns = Object.keys(response.contacts[0] || {});
                                toasts.success(`Found ${contacts.length} contacts`);
                        } else {
                                toasts.error('No contacts found in Excel file');
                        }
                } catch (err) {
                        toasts.error(err instanceof Error ? err.message : 'Failed to parse Excel file');
                        excelFile = null;
                } finally {
                        isParsing = false;
                }
        }

        function handleHtmlUpload(e: Event) {
                const input = e.target as HTMLInputElement;
                const file = input.files?.[0];
                if (!file) return;

                htmlTemplate = file;
                const reader = new FileReader();
                reader.onload = () => {
                        if (typeof reader.result === 'string') {
                                htmlContent = reader.result;
                                toasts.success('HTML template loaded');
                        }
                };
                reader.readAsText(file);
        }

        function getRecipientCount(): number {
                if (contacts.length === 0) return 0;
                if (rangeType === 'all') return contacts.length;
                if (rangeType === 'first') return Math.min(rangeCount, contacts.length);
                return Math.min(rangeCount, contacts.length - rangeStart + 1);
        }

        async function handleSubmit() {
                if (!$configsStore.selectedConfig) {
                        toasts.error('Please select an SMTP configuration');
                        return;
                }
                if (!subject.trim()) {
                        toasts.error('Please enter a subject');
                        return;
                }
                if (!htmlContent.trim()) {
                        toasts.error('Please enter email content');
                        return;
                }
                if (contacts.length === 0) {
                        toasts.error('Please upload an Excel file with contacts');
                        return;
                }

                isSending = true;
                try {
                        const data: Parameters<typeof sendEmails>[0] = {
                                configId: $configsStore.selectedConfig.id,
                                subject,
                                htmlContent,
                                useBatch,
                                scheduleEmail,
                                notifyBrowser
                        };

                        if (excelFile) data.excelFile = excelFile;
                        if (htmlTemplate) data.htmlTemplate = htmlTemplate;
                        if (useBatch) {
                                data.batchSize = batchSize;
                                data.batchDelay = batchDelay;
                                data.emailDelay = emailDelay;
                        }
                        if (scheduleEmail && scheduledTime) {
                                data.scheduledTime = new Date(scheduledTime).toISOString();
                                if (notifyEmail) data.notifyEmail = notifyEmail;
                        }
                        if (rangeType !== 'all') {
                                data.emailRangeStart = rangeType === 'first' ? 1 : rangeStart;
                                data.emailRangeCount = rangeCount;
                        }

                        const response = await sendEmails(data);
                        if (response.success) {
                                toasts.success(response.message || 'Emails sent successfully!');
                                goto('/');
                        }
                } catch (err) {
                        toasts.error(err instanceof Error ? err.message : 'Failed to send emails');
                } finally {
                        isSending = false;
                }
        }

        function insertPlaceholder(placeholder: string) {
                if (emailEditor) {
                        emailEditor.insertText(` {{${placeholder}}}`);
                } else {
                        htmlContent += ` {{${placeholder}}}`;
                }
        }

        function handleEditorChange(e: CustomEvent<string>) {
                htmlContent = e.detail;
        }
</script>

<svelte:head>
        <title>Compose Email - Email Sender</title>
</svelte:head>

<div class="space-y-6">
        <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-white">Compose Email</h1>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                        <!-- SMTP Selection -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">SMTP Configuration</h2>
                                {#if $configsStore.configs.length === 0}
                                        <Alert type="warning">
                                                No SMTP configurations found. <a href="/configs" class="underline">Add one first</a>.
                                        </Alert>
                                {:else}
                                        <label for="smtp-select" class="label">Select Configuration</label>
                                        <select 
                                                id="smtp-select"
                                                class="input"
                                                value={$configsStore.selectedConfig?.id || ''}
                                                on:change={(e) => {
                                                        const config = $configsStore.configs.find(c => c.id === e.currentTarget.value);
                                                        configsStore.selectConfig(config || null);
                                                }}
                                        >
                                                <option value="">-- Select Configuration --</option>
                                                {#each $configsStore.configs as config}
                                                        <option value={config.id}>{config.name} ({config.from_email})</option>
                                                {/each}
                                        </select>
                                {/if}
                        </div>

                        <!-- Email Content -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Email Content</h2>
                                <div class="space-y-4">
                                        <div>
                                                <label for="subject" class="label">Subject</label>
                                                <input type="text" id="subject" bind:value={subject} class="input" placeholder="Email subject..." />
                                        </div>

                                        <fieldset class="space-y-2">
                                                <legend class="label">Email Content</legend>
                                                {#if columns.length > 0}
                                                        <div class="flex flex-wrap gap-2 mb-2">
                                                                <span class="text-sm text-gray-500">Insert placeholder:</span>
                                                                {#each columns as col}
                                                                        <button
                                                                                type="button"
                                                                                class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                                                                                on:click={() => insertPlaceholder(col)}
                                                                        >
                                                                                {`{{${col}}}`}
                                                                        </button>
                                                                {/each}
                                        </div>
                                {/if}
                                <EmailEditor 
                                        bind:this={emailEditor}
                                        value={htmlContent}
                                        placeholder="Write your email content here..."
                                        on:change={handleEditorChange}
                                />
                                        </fieldset>
                                </div>
                        </div>

                        <!-- File Uploads -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Files</h2>
                                <div class="grid md:grid-cols-2 gap-4">
                                        <div>
                                                <label for="excel-upload" class="label">Excel File (Required)</label>
                                                <input 
                                                        id="excel-upload"
                                                        type="file" 
                                                        accept=".xlsx,.xls,.csv"
                                                        on:change={handleExcelUpload}
                                                        class="input"
                                                />
                                                {#if isParsing}
                                                        <div class="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                                <Spinner size="sm" /> Parsing...
                                                        </div>
                                                {:else if contacts.length > 0}
                                                        <p class="text-sm text-green-600 mt-2">{contacts.length} contacts loaded</p>
                                                {/if}
                                        </div>
                                        <div>
                                                <label for="html-upload" class="label">HTML Template (Optional)</label>
                                                <input 
                                                        id="html-upload"
                                                        type="file" 
                                                        accept=".html,.htm"
                                                        on:change={handleHtmlUpload}
                                                        class="input"
                                                />
                                        </div>
                                </div>
                        </div>
                </div>

                <div class="space-y-6">
                        <!-- Email Range -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Recipients</h2>
                                <fieldset class="space-y-3">
                                        <legend class="sr-only">Email Range Selection</legend>
                                        <label class="flex items-center gap-2">
                                                <input type="radio" bind:group={rangeType} value="all" />
                                                <span>All contacts ({contacts.length})</span>
                                        </label>
                                        <label class="flex items-center gap-2">
                                                <input type="radio" bind:group={rangeType} value="first" />
                                                <span>First N contacts</span>
                                        </label>
                                        <label class="flex items-center gap-2">
                                                <input type="radio" bind:group={rangeType} value="custom" />
                                                <span>Custom range</span>
                                        </label>

                                        {#if rangeType === 'first'}
                                                <label for="range-count-first" class="label">Number of contacts</label>
                                                <input id="range-count-first" type="number" bind:value={rangeCount} min="1" class="input" placeholder="Number of contacts" />
                                        {:else if rangeType === 'custom'}
                                                <div class="grid grid-cols-2 gap-2">
                                                        <div>
                                                                <label for="range-start" class="label">Start</label>
                                                                <input id="range-start" type="number" bind:value={rangeStart} min="1" class="input" placeholder="Start" />
                                                        </div>
                                                        <div>
                                                                <label for="range-count" class="label">Count</label>
                                                                <input id="range-count" type="number" bind:value={rangeCount} min="1" class="input" placeholder="Count" />
                                                        </div>
                                                </div>
                                        {/if}

                                        <p class="text-sm text-gray-500">
                                                Will send to: <strong>{getRecipientCount()}</strong> recipients
                                        </p>
                                </fieldset>
                        </div>

                        <!-- Batch Settings -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Batch Processing</h2>
                                <label for="batch-checkbox" class="flex items-center gap-2 mb-4">
                                        <input id="batch-checkbox" type="checkbox" bind:checked={useBatch} />
                                        <span>Enable batch processing</span>
                                </label>

                                {#if useBatch}
                                        <div class="space-y-3">
                                                <div>
                                                        <label for="batch-size" class="label">Batch Size</label>
                                                        <input id="batch-size" type="number" bind:value={batchSize} min="1" class="input" />
                                                </div>
                                                <div>
                                                        <label for="batch-delay" class="label">Delay Between Batches (seconds)</label>
                                                        <input id="batch-delay" type="number" bind:value={batchDelay} min="1" class="input" />
                                                </div>
                                                <div>
                                                        <label for="email-delay" class="label">Delay Between Emails (seconds)</label>
                                                        <input id="email-delay" type="number" bind:value={emailDelay} min="0" step="0.1" class="input" />
                                                </div>
                                        </div>
                                {/if}
                        </div>

                        <!-- Schedule -->
                        <div class="card">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Schedule</h2>
                                <label for="schedule-checkbox" class="flex items-center gap-2 mb-4">
                                        <input id="schedule-checkbox" type="checkbox" bind:checked={scheduleEmail} />
                                        <span>Schedule for later</span>
                                </label>

                                {#if scheduleEmail}
                                        <div class="space-y-3">
                                                <div>
                                                        <label for="scheduled-time" class="label">Send At</label>
                                                        <input id="scheduled-time" type="datetime-local" bind:value={scheduledTime} class="input" />
                                                </div>
                                                <div>
                                                        <label for="notify-email" class="label">Notify Email (Optional)</label>
                                                        <input id="notify-email" type="email" bind:value={notifyEmail} class="input" placeholder="your@email.com" />
                                                </div>
                                                <label for="notify-browser" class="flex items-center gap-2">
                                                        <input id="notify-browser" type="checkbox" bind:checked={notifyBrowser} />
                                                        <span class="text-sm">Browser notification</span>
                                                </label>
                                        </div>
                                {/if}
                        </div>

                        <!-- Submit -->
                        <button 
                                class="btn-primary w-full flex items-center justify-center gap-2"
                                on:click={handleSubmit}
                                disabled={isSending || contacts.length === 0}
                        >
                                {#if isSending}
                                        <Spinner size="sm" />
                                        Sending...
                                {:else if scheduleEmail}
                                        Schedule Emails
                                {:else}
                                        Send Emails
                                {/if}
                        </button>
                </div>
        </div>
</div>