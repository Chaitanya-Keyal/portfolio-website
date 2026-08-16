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
	<p class="cursor">▮</p>
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

	.cursor {
		color: var(--accent);
		animation: blink 1s step-start infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
