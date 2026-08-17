<script lang="ts">
	import { banner, bootLines } from '$lib/data/terminal';

	interface Props {
		ondone: () => void;
	}
	let { ondone }: Props = $props();

	let visible = $state(0);

	$effect(() => {
		const timer = setInterval(() => {
			visible += 1;
			if (visible >= bootLines.length) {
				clearInterval(timer);
				setTimeout(ondone, 350);
			}
		}, 220);
		return () => clearInterval(timer);
	});
</script>

<!-- Keyboard dismissal lives in the layout's global handler (any key while
     booting); this surface only needs the pointer path. -->
<div class="boot" role="presentation" onclick={ondone} aria-hidden="true">
	<pre class="banner">{banner}</pre>
	{#each bootLines.slice(0, visible) as line (line)}
		<p>{line}</p>
	{/each}
	<p class="cursor"></p>
</div>

<style>
	.boot {
		position: fixed;
		inset: 0;
		z-index: 30;
		background: var(--bg);
		padding: 24px;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.banner {
		margin: 0 0 16px;
		color: var(--accent);
		font-size: 0.8125rem;
		line-height: 1.25;
		text-shadow: 0 0 10px color-mix(in srgb, currentColor 35%, transparent);
	}

	p {
		color: var(--muted);
	}

	/* Drawn rather than typed: U+25AE sits inside the symbols2 unicode-range
	   but is not actually in that subset, so as a character it always fell
	   back to a system font at some other width. */
	.cursor::before {
		content: '';
		display: inline-block;
		width: 0.6em;
		height: 1em;
		vertical-align: -0.15em;
		background: var(--accent);
	}

	.cursor {
		animation: blink 1s step-start infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
