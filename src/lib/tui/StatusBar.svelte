<script lang="ts">
	import { profile } from '$lib/data/profile';

	interface Props {
		theme: string;
		mode: string;
		onthemecycle: () => void;
	}
	let { theme, mode, onthemecycle }: Props = $props();

	// My clock, not the visitor's: the point of it is where I am, so the zone
	// is fixed and labelled. sv-SE is the locale whose short date and medium
	// time formats are already ISO-shaped.
	const ZONE = 'Asia/Kolkata';
	const ZONE_LABEL = 'IST';
	const reading = () =>
		`${new Date().toLocaleString('sv-SE', { timeZone: ZONE, dateStyle: 'short', timeStyle: 'medium' })} ${ZONE_LABEL}`;

	// Empty until it is running: a prerendered clock would be a lie, stale by
	// however long ago the site was built.
	let clock = $state('');

	$effect(() => {
		clock = reading();
		const tick = setInterval(() => (clock = reading()), 1000);
		return () => clearInterval(tick);
	});
</script>

<footer class="no-print">
	<span class="mode" class:alt={mode !== 'normal'}>{mode}</span>
	<span class="meta">
		<button type="button" class="theme" onclick={onthemecycle} title="switch theme">
			◐ {theme}
		</button>
		<span class="sep" aria-hidden="true">·</span>
		<span class="stamp">
			<!-- Local builds have no commit to point at. -->
			{#if __COMMIT__ === 'dev'}
				{__COMMIT__}
			{:else}
				<a href="{profile.repo}/commit/{__COMMIT__}" rel="noopener">{__COMMIT__}</a>
			{/if}
			<!-- Holds its width while empty, so nothing shifts when it starts. -->
			<span class="clock"
				>{#if clock}· {clock}{/if}</span
			>
		</span>
	</span>
</footer>

<style>
	footer {
		grid-area: status;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 4px 12px 4px 4px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--muted);
		font-size: 0.7812rem;
		white-space: nowrap;
	}

	/* vim-style mode segment */
	.mode {
		background: var(--accent);
		color: var(--bg);
		font-weight: 700;
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 3px 10px;
	}
	.mode.alt {
		background: var(--purple);
	}

	.meta {
		display: inline-flex;
		align-items: center;
	}

	button:hover,
	.theme {
		color: var(--accent);
	}
	.theme:hover {
		background: var(--bg-hl);
	}

	.sep {
		color: var(--faint);
		margin: 0 4px;
	}

	/* `· ` plus `YYYY-MM-DD HH:MM:SS IST`, in a font where every glyph is one
	   ch wide. */
	.clock {
		display: inline-block;
		min-width: 25ch;
		text-align: right;
	}

	/* Phone: mode + theme only; the build stamp is desktop furniture. */
	@media (max-width: 719px) {
		.meta .sep,
		.stamp {
			display: none;
		}
	}
</style>
