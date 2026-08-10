<script lang="ts">
	import ManPage from '$lib/components/ManPage.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { projectDoc } from '$lib/components/mandoc';

	let { data } = $props();
	const doc = $derived(projectDoc(data.project));
</script>

<Meta
	title="{data.project.slug} — Chaitanya Keyal"
	description="{data.project.name} — {data.project.oneLiner}"
	path="/projects/{data.project.slug}"
/>

<ManPage {doc} />
