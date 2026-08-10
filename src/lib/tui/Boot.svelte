<script lang="ts">
	interface Props {
		ondone: () => void;
	}
	let { ondone }: Props = $props();

	const BANNER = String.raw`       _              _
  ___ | | ____ _ _  _| |__  _ _ ___
 / _ \| |/ / _' | || | '_ \| '_/ _ \
 \___/|_|\_\__,_|\_, |_.__/|_| \___/
                 |__/`;

	const lines = [
		'okaybro-boot 1.0',
		'[  OK  ] mount /projects',
		'[  OK  ] load profile: chaitanya keyal',
		'[  OK  ] start ui'
	];

	let visible = $state(0);

	$effect(() => {
		const timer = setInterval(() => {
			visible += 1;
			if (visible >= lines.length) {
				clearInterval(timer);
				setTimeout(ondone, 350);
			}
		}, 220);
		return () => clearInterval(timer);
	});
</script>

<!-- Keyboard dismissal lives in the layout's global handler (any key while
     booting); this surface only needs the pointer path. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="boot" role="presentation" onclick={ondone} aria-hidden="true">
	<pre class="banner">{BANNER}</pre>
	{#each lines.slice(0, visible) as line (line)}
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
