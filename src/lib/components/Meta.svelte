<script lang="ts">
	import { profile } from '$lib/data/profile';

	interface Props {
		title: string;
		description: string;
		path: string;
	}
	let { title, description, path }: Props = $props();

	const url = $derived(profile.site + (path === '/' ? '' : path));
	const image = $derived(
		`${profile.site}/og/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.png`
	);
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
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={image} />
</svelte:head>
