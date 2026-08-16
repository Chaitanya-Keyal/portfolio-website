<script lang="ts">
	import ManPage from '$lib/components/ManPage.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { workDoc } from '$lib/text/mandoc';

	let { data } = $props();
	const doc = $derived(workDoc(data.job));
</script>

<Meta
	title={data.job.slug}
	description="{data.job.org} — {data.job.oneLiner}"
	page="/work/{data.job.slug}"
/>

<ManPage {doc} />
