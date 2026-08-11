<script lang="ts">
	// The one allowed easter egg: the mark decodes itself on arrival.
	// Solid blocks only: outline glyphs (╔╝═) turn the K's arms into an H
	// crossbar once the mark is scaled up.
	const ART = [
		' ██████    ███    ███',
		'███        ███  ███  ',
		'███        ██████    ',
		'███        ██████    ',
		'███        ███  ███  ',
		' ██████    ███    ███'
	];

	const POOL = '█▓▒░╬╣║╔╝<>/\\+=*';

	let lines = $state(ART);
	let settled = true;
	let lastMove = 0;

	function scramble() {
		if (!settled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		settled = false;
		const start = performance.now();
		const duration = 900;
		const frame = (now: number) => {
			const progress = Math.min(1, (now - start) / duration);
			const resolved = Math.floor(progress * ART[0].length);
			lines = ART.map((line) =>
				[...line]
					.map((ch, i) => {
						if (ch === ' ' || i < resolved) return ch;
						return POOL[Math.floor(Math.random() * POOL.length)];
					})
					.join('')
			);
			if (progress < 1) requestAnimationFrame(frame);
			else settled = true;
		};
		requestAnimationFrame(frame);
	}

	$effect(() => {
		scramble();
	});
</script>

<!-- Hover re-scrambles, but only on a real hover: browsers re-fire mouseenter
     when content scrolls under a stationary cursor, so we require recent
     actual pointer movement before animating. -->
<svelte:window onpointermove={() => (lastMove = performance.now())} />
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<pre
	aria-hidden="true"
	onclick={scramble}
	onmouseenter={() => performance.now() - lastMove < 150 && scramble()}
>{lines.join('\n')}</pre>

<style>
	/* Size and color are set by the host via --logo-size / --logo-color. */
	pre {
		margin: 0;
		color: var(--logo-color, var(--faint));
		font-size: var(--logo-size, 0.6875rem);
		line-height: 1.15;
		user-select: none;
		cursor: default;
	}
	pre:hover {
		color: var(--accent);
	}
</style>
