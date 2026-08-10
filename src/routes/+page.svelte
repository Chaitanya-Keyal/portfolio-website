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
		max-width: none;
	}

	section,
	.edu,
	.status {
		max-width: 80ch;
	}

	/* Display-scale hero. Fira Code advance is 0.6em and the name plus cursor
	   is 16 glyphs, so pane-width ÷ 9.6 spans it in exactly one line.
	   24rem ≈ rail + gaps + main padding. */
	h1 {
		font-size: clamp(2rem, calc((100vw - 24rem) / 9.6), 15rem);
		line-height: 1.05;
		white-space: nowrap;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--fg);
		margin-bottom: 24px;
	}

	@media (max-width: 719px) {
		h1 {
			/* No rail column on phones — only the main padding. */
			font-size: calc((100vw - 4rem) / 9.6);
		}
	}

	.tagline {
		color: var(--cyan);
		font-size: clamp(1rem, 1.6vw, 1.75rem);
		letter-spacing: 0.05em;
		margin-bottom: 16px;
	}

	.edu {
		color: var(--muted);
		font-size: clamp(0.8438rem, 1.1vw, 1.125rem);
	}

	.status {
		color: var(--green);
		font-size: clamp(0.8438rem, 1.1vw, 1.125rem);
		margin-top: 18px;
	}

	section {
		margin-top: 44px;
	}

	h2 {
		font-size: clamp(0.8125rem, 0.95vw, 1rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--yellow);
		margin-bottom: 12px;
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
