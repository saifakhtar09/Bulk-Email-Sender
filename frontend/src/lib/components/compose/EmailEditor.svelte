<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import type Quill from 'quill';

	export let value = '';
	export let placeholder = 'Write your email content here...';
	
	const dispatch = createEventDispatcher<{ change: string }>();
	
	let editorContainer: HTMLDivElement;
	let quillInstance: Quill | null = null;

	onMount(async () => {
		const QuillModule = await import('quill');
		const Quill = QuillModule.default;
		
		await import('quill/dist/quill.snow.css');
		
		quillInstance = new Quill(editorContainer, {
			theme: 'snow',
			placeholder,
			modules: {
				toolbar: [
					[{ header: [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ color: [] }, { background: [] }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					[{ align: [] }],
					['link', 'image'],
					['clean']
				]
			}
		});

		if (value) {
			quillInstance.root.innerHTML = value;
		}

		quillInstance.on('text-change', () => {
			const html = quillInstance?.root.innerHTML || '';
			dispatch('change', html);
		});
	});

	onDestroy(() => {
		quillInstance = null;
	});

	export function insertText(text: string) {
		if (quillInstance) {
			const range = quillInstance.getSelection(true);
			quillInstance.insertText(range.index, text);
		}
	}

	export function getHTML(): string {
		return quillInstance?.root.innerHTML || '';
	}

	$: if (quillInstance && value !== quillInstance.root.innerHTML) {
		quillInstance.root.innerHTML = value;
	}
</script>

<div class="quill-wrapper border border-gray-200 rounded-lg overflow-hidden">
	<div bind:this={editorContainer}></div>
</div>

<style>
	.quill-wrapper :global(.ql-container) {
		min-height: 200px;
		font-size: 16px;
	}
	
	.quill-wrapper :global(.ql-editor) {
		min-height: 200px;
	}
	
	.quill-wrapper :global(.ql-toolbar) {
		border-top: none;
		border-left: none;
		border-right: none;
		background: #f9fafb;
	}
	
	.quill-wrapper :global(.ql-container) {
		border: none;
	}
</style>
