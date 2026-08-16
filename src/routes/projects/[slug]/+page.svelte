<script lang="ts">
	import ManPage from '$lib/components/ManPage.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { projectDoc } from '$lib/text/mandoc';

	let { data } = $props();
	const doc = $derived(projectDoc(data.project));
</script>

<Meta
	title={data.project.slug}
	description="{data.project.name} — {data.project.oneLiner}"
	page="/projects/{data.project.slug}"
/>

<ManPage {doc} />
