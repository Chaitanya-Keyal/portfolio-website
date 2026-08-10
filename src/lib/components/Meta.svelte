<script lang="ts">
	import { profile } from '$lib/data/profile';

	interface Props {
		title: string;
		description: string;
		path: string;
	}
	let { title, description, path }: Props = $props();

	const url = $derived(profile.site + (path === '/' ? '' : path));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={profile.name} />
	<meta name="twitter:card" content="summary" />
</svelte:head>
