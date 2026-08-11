<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import PixelPortrait from '$lib/components/PixelPortrait.svelte';
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

	// The portrait is a fixed grid of characters, so its height is exactly
	// proportional to the character size. Measure it once, then solve for the
	// size that stands it flush with the text beside it — rows can be added to
	// the list below and the two columns still line up top and bottom.
	let logo = $state<HTMLElement>();
	let info = $state<HTMLElement>();
	let size = $state(0);
	let cramped = $state(false);

	// Bounds on the character size, and the width the text column is entitled to
	// keep — whatever is left over is the portrait's.
	const MIN_PX = 5;
	const MAX_PX = 14;
	const INFO_MIN_REM = 34;

	$effect(() => {
		const logoEl = logo;
		const infoEl = info;
		const row = infoEl?.parentElement;
		if (!logoEl || !infoEl || !row) return;

		// Portrait height and width for a 1px character, taken from whatever size
		// CSS starts it at; constant thereafter. The basis has to come off the
		// <pre>'s own font-size — a custom property reads back unresolved.
		let perPxHigh = 0;
		let perPxWide = 0;

		// An arrow declared after the guard above, so the element types stay
		// narrowed inside it.
		const fit = () => {
			if (!perPxHigh) {
				const pre = logoEl.querySelector('pre');
				const box = logoEl.getBoundingClientRect();
				if (!pre || !box.height) return; // hidden by the phone layout
				const unit = parseFloat(getComputedStyle(pre).fontSize);
				perPxHigh = box.height / unit;
				perPxWide = box.width / unit;
			}
			// Room is measured off the row rather than the portrait, so it stays
			// true once the portrait is out of the flow.
			const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
			const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
			const room = (row.clientWidth - gap - INFO_MIN_REM * rem) / perPxWide;
			cramped = room < MIN_PX;
			if (cramped) return;

			const target = infoEl.getBoundingClientRect().height / perPxHigh;
			const next = Math.min(target, room, MAX_PX);
			// Ignoring hair-thin corrections keeps a resize from oscillating:
			// the portrait's width feeds back into how the text wraps.
			if (Math.abs(next - size) > 0.05) size = next;
		};

		const observer = new ResizeObserver(fit);
		observer.observe(infoEl);
		return () => observer.disconnect();
	});

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
	<div class="logo" class:cramped bind:this={logo} style:--px-size={size ? `${size}px` : null}>
		<PixelPortrait />
	</div>

	<div class="info" bind:this={info}>
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

	/* The portrait is a grid of half-block characters, so the character size is
	   the pixel size. The script above replaces this with the size that matches
	   the text height; the rem keeps it proportional when it cannot run. */
	.logo {
		--px-size: 0.3125rem;
		flex-shrink: 0;
	}

	/* Too narrow to seat the portrait without squeezing the text into a ragged
	   column — the text wins. */
	.logo.cramped {
		display: none;
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
		/* No room for the portrait beside the info on a phone, and stacking it
		   just pushes everything below the fold. */
		.logo {
			display: none;
		}
		.row {
			grid-template-columns: 5.5rem 1fr;
			gap: 8px;
		}
	}
</style>
