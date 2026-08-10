<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import Monogram from '$lib/components/Monogram.svelte';
	import { profile } from '$lib/data/profile';

	const skillGroups = [
		['languages', profile.skills.languages],
		['ai', profile.skills.ai],
		['backend', profile.skills.backend],
		['infra', profile.skills.infra]
	] as const;

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: profile.name,
		url: profile.site,
		email: `mailto:${profile.contact.email}`,
		sameAs: [profile.contact.github, profile.contact.linkedin],
		alumniOf: profile.education.school,
		description: profile.summary
	});
</script>

<Meta title="Chaitanya Keyal — backend systems · AI agents · open source" description={profile.summary} path="/" />

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<div class="home reveal">
	<h1>{profile.name}<span class="cursor-block" aria-hidden="true">▮</span></h1>
	<p class="tagline">{profile.tagline}</p>
	<p class="edu">
		{profile.education.degree} · {profile.education.school} · class of {profile.education.classOf}
	</p>
	<p class="status"><span aria-hidden="true">●</span> {profile.status}</p>

	<section>
		<h2>synopsis</h2>
		<dl class="skills">
			{#each skillGroups as [group, items] (group)}
				<dt>{group}</dt>
				<dd>{items.join(', ')}</dd>
			{/each}
		</dl>
	</section>

	<section>
		<h2>contact</h2>
		<ul class="contact">
			<li><a href="mailto:{profile.contact.email}">{profile.contact.email}</a></li>
			<li><a href={profile.contact.github} rel="me noopener">github/Chaitanya-Keyal ↗</a></li>
			<li><a href={profile.contact.linkedin} rel="me noopener">linkedin/chaitanya-keyal ↗</a></li>
			<li><a href="{base}/resume">resume</a></li>
		</ul>
	</section>

	<Monogram />
</div>

<style>
	.home {
		max-width: 72ch;
	}

	h1 {
		font-size: clamp(22px, 4vw, 30px);
		font-weight: 700;
		color: var(--fg);
		margin-bottom: 12px;
	}

	.tagline {
		color: var(--cyan);
		font-size: 14px;
		letter-spacing: 0.04em;
		margin-bottom: 10px;
	}

	.edu {
		color: var(--muted);
		font-size: 13.5px;
	}

	.status {
		color: var(--green);
		font-size: 13.5px;
		margin-top: 14px;
	}

	section {
		margin-top: 36px;
	}

	h2 {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--yellow);
		margin-bottom: 10px;
	}

	.skills dd {
		color: var(--muted);
	}

	.skills {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 4px 24px;
	}
	.skills dt {
		color: var(--muted);
	}

	.contact li {
		margin-bottom: 4px;
	}

	@media (max-width: 719px) {
		.skills {
			grid-template-columns: 1fr;
			gap: 2px;
		}
		.skills dd {
			margin-bottom: 10px;
		}
	}
</style>
