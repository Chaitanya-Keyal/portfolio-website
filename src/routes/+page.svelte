<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import Monogram from '$lib/components/Monogram.svelte';
	import { profile } from '$lib/data/profile';
	import { projects } from '$lib/data/projects';
	import { experience } from '$lib/data/experience';

	const title = `${profile.handle}@dev`;
	const rule = '─'.repeat(title.length);

	const skills = [
		['languages', profile.skills.languages],
		['ai', profile.skills.ai],
		['backend', profile.skills.backend],
		['infra', profile.skills.infra]
	] as const;

	// Reads the live theme, so the strip is the palette you are looking at.
	const swatches = ['--red', '--green', '--yellow', '--accent', '--purple', '--cyan', '--muted', '--faint'];

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

<div class="fetch reveal">
	<div class="logo"><Monogram /></div>

	<div class="info">
		<h1><span class="user">{profile.handle}</span><span class="at">@</span><span class="user">dev</span></h1>
		<p class="rule" aria-hidden="true">{rule}</p>

		<dl>
			<div class="row"><dt>name</dt><dd class="strong">{profile.name}</dd></div>
			<div class="row"><dt>os</dt><dd>{profile.education.school}</dd></div>
			<div class="row"><dt>kernel</dt><dd>{profile.education.degree}</dd></div>
			<div class="row"><dt>uptime</dt><dd>class of {profile.education.classOf}</dd></div>
			<div class="row"><dt>shell</dt><dd>{profile.tagline}</dd></div>
			<div class="row"><dt>role</dt><dd>{profile.role}</dd></div>
			<div class="row">
				<dt>packages</dt>
				<dd>{projects.length} projects · {experience.length} roles</dd>
			</div>
			<div class="row"><dt>status</dt><dd class="status">{profile.status}</dd></div>

			<div class="spacer"></div>

			{#each skills as [group, items] (group)}
				<div class="row"><dt>{group}</dt><dd>{items.join(', ')}</dd></div>
			{/each}

			<div class="spacer"></div>

			<div class="row">
				<dt>email</dt>
				<dd><a href="mailto:{profile.contact.email}">{profile.contact.email}</a></dd>
			</div>
			<div class="row">
				<dt>github</dt>
				<dd><a href={profile.contact.github} rel="me noopener">github.com/Chaitanya-Keyal</a></dd>
			</div>
			<div class="row">
				<dt>linkedin</dt>
				<dd><a href={profile.contact.linkedin} rel="me noopener">linkedin.com/in/chaitanya-keyal</a></dd>
			</div>
			<div class="row">
				<dt>resume</dt>
				<dd><a href="{base}/resume">okaybro.dev/resume</a></dd>
			</div>
		</dl>

		<p class="palette" aria-hidden="true">
			{#each swatches as swatch (swatch)}<span style="color: var({swatch})">███</span>{/each}
		</p>
	</div>
</div>

<style>
	.fetch {
		display: flex;
		align-items: flex-start;
		gap: clamp(24px, 4vw, 56px);
		flex-wrap: wrap;
	}

	.logo {
		/* 40 columns wide: sized so the portrait reads without crowding the
		   info column. */
		--logo-size: clamp(0.6rem, 0.98vw, 1.25rem);
		--logo-color: var(--accent);
		padding-top: 2px;
		flex-shrink: 0;
	}

	.info {
		min-width: 0;
		flex: 1;
	}

	h1 {
		font-size: 1rem;
		font-weight: 700;
	}
	.user {
		color: var(--green);
	}
	.at {
		color: var(--fg);
	}

	.rule {
		color: var(--muted);
		margin-bottom: 6px;
	}

	.row {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		gap: 12px;
		padding: 1px 0;
	}

	dt {
		color: var(--accent);
		font-weight: 700;
	}

	dd {
		color: var(--muted);
		overflow-wrap: anywhere;
	}
	.strong {
		color: var(--fg);
	}
	.status {
		color: var(--green);
	}

	.spacer {
		height: 0.9em;
	}

	.palette {
		margin-top: 14px;
		letter-spacing: -0.06em;
	}

	@media (max-width: 719px) {
		.fetch {
			gap: 16px;
		}
		.logo {
			--logo-size: min(0.8rem, 2.1vw);
			width: 100%;
		}
		.row {
			grid-template-columns: 5.5rem 1fr;
			gap: 8px;
		}
	}
</style>
