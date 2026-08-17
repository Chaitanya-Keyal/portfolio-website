<script lang="ts">
	import { profile } from '$lib/data/profile';
	import { pageAt } from '$lib/content';

	interface Props {
		/** The page's path; its title and description come from the page list. */
		page: string;
		/** Overrides, for pages whose copy is computed from their content. */
		title?: string;
		description?: string;
	}
	let { page, title, description }: Props = $props();

	const entry = $derived(pageAt(page));
	const heading = $derived(title ?? entry?.title ?? entry?.name ?? '');
	const blurb = $derived(description ?? entry?.description ?? '');

	// Every tab ends with the name; the home title already leads with it, so it
	// is not appended twice.
	const full = $derived(heading.includes(profile.name) ? heading : `${heading} | ${profile.name}`);
	const url = $derived(profile.site + (page === '/' ? '' : page));
	const image = $derived(
		`${profile.site}/og/${page === '/' ? 'home' : page.slice(1).replaceAll('/', '-')}.png`
	);
</script>

<svelte:head>
	<title>{full}</title>
	<meta name="description" content={blurb} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={full} />
	<meta property="og:description" content={blurb} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={profile.name} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={image} />
</svelte:head>
