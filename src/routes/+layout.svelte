<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { profile } from '$lib/data/profile';
	import Rail from '$lib/tui/Rail.svelte';
	import StatusBar from '$lib/tui/StatusBar.svelte';
	import Shell from '$lib/tui/Shell.svelte';
	import Boot from '$lib/tui/Boot.svelte';
	import { currentTheme, setTheme, themes, DEFAULT_THEME, type Theme } from '$lib/tui/theme';

	let { children } = $props();

	let theme = $state<Theme>(DEFAULT_THEME);
	let booting = $state(false);
	let poweringOn = $state(false);
	let shellFocused = $state(false);
	let shell = $state<{ focusPrompt: () => void; exec: (command: string) => void }>();

	// App-internal path with the deployment base stripped — the shell's cwd.
	const cwd = $derived(page.url.pathname.slice(base.length).replace(/\/$/, '') || '/');
	const mode = $derived(booting ? 'boot' : shellFocused ? 'insert' : 'normal');

	onMount(() => {
		theme = currentTheme();
		// Boot exactly once per session, and only when the session starts on the
		// homepage — marked seen on any first page view so client-side
		// navigation never replays it.
		let seen = true;
		try {
			seen = sessionStorage.getItem('booted') === '1';
			sessionStorage.setItem('booted', '1');
		} catch {}
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (cwd === '/' && !seen && !reducedMotion) booting = true;
	});

	function finishBoot() {
		if (!booting) return;
		booting = false;
		poweringOn = true;
	}

	// The scroll container is #main, not the window, so SvelteKit's own
	// post-navigation scroll reset never reaches it — without this, the next
	// page opens at the previous page's scroll offset.
	afterNavigate(() => {
		document.getElementById('main')?.scrollTo(0, 0);
	});

	function navigate(to: string) {
		if (to.endsWith('.txt')) location.href = base + to;
		// keepFocus: navigating from the prompt (`cd`, `man`) must not kick you
		// out of the terminal mid-session.
		else goto(base + to, { keepFocus: true });
	}

	function applyTheme(next: Theme) {
		setTheme(next);
		theme = next;
	}

	function cycleTheme() {
		applyTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);
	}

	function toggleCrt(): 'on' | 'off' {
		const root = document.documentElement;
		const next = root.dataset.crt === 'off' ? 'on' : 'off';
		root.dataset.crt = next;
		try {
			localStorage.setItem('crt', next);
		} catch {}
		return next;
	}

	function onkeydown(event: KeyboardEvent) {
		if (booting) {
			finishBoot();
			return;
		}
		const target = event.target as HTMLElement | null;
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		switch (event.key) {
			case ':':
			case '/':
				event.preventDefault();
				shell?.focusPrompt();
				break;
			case '?':
				shell?.exec('help');
				break;
		}
	}

	// Note: no wheel handling anywhere — scrolling is fully native. Each pane
	// scrolls under the cursor like any normal app; JS never touches the mouse.
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<meta name="author" content={profile.name} />
</svelte:head>

<a class="skip no-print" href="#main">skip to content</a>

<div class="frame" class:power-on={poweringOn} onanimationend={() => (poweringOn = false)}>
	<Rail />
	<div class="pane pane-main">
		<span class="pane-title" aria-hidden="true">{cwd === '/' ? '~' : `~${cwd}`}</span>
		<main id="main" tabindex="-1">
			{@render children()}
		</main>
	</div>
	<Shell
		bind:this={shell}
		{cwd}
		onnav={navigate}
		ontheme={applyTheme}
		oncrt={toggleCrt}
		onfocuschange={(focused) => (shellFocused = focused)}
	/>
	<StatusBar {theme} {mode} onthemecycle={cycleTheme} />
</div>

{#if booting}
	<Boot ondone={finishBoot} />
{/if}

<style>
	.skip {
		position: absolute;
		left: -9999px;
		z-index: 40;
		padding: 8px 16px;
		background: var(--bg-hl);
		color: var(--fg);
	}
	.skip:focus {
		left: 8px;
		top: 8px;
	}

	.frame {
		display: grid;
		height: 100dvh;
		padding: 10px;
		gap: 8px;
		background: var(--bg-panel);
		/* rem so the rail keeps pace with the scaled type on large screens */
		grid-template-columns: 14rem 1fr;
		grid-template-rows: 1fr auto auto;
		grid-template-areas:
			'rail main'
			'cmd  cmd'
			'status status';
	}

	/* CRT power-on after the boot sequence. */
	.power-on {
		animation: crt-on 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
		transform-origin: center;
	}

	@keyframes crt-on {
		0% {
			transform: scaleY(0.004);
			filter: brightness(4);
		}
		65% {
			transform: scaleY(1.015);
			filter: brightness(1.3);
		}
		100% {
			transform: none;
			filter: none;
		}
	}

	.pane-main {
		grid-area: main;
		display: flex;
		min-width: 0;
	}

	main {
		flex: 1;
		/* min-width: 0 stops wide content (80ch pre blocks) from propagating
		   its intrinsic width up through the grid and past the viewport. */
		min-width: 0;
		overflow-y: auto;
		padding: 30px clamp(20px, 5vw, 56px) 48px;
	}
	main:focus {
		outline: none;
	}

	@media (max-width: 719px) {
		.frame {
			padding: 8px;
			gap: 6px;
			grid-template-columns: 1fr;
			grid-template-areas:
				'main'
				'cmd'
				'status'
				'rail';
		}
		main {
			padding: 20px 20px 40px;
		}
		/* The cwd lives in the prompt on phones; the floating title only
		   clips against the tight frame padding. */
		.pane-main :global(.pane-title) {
			display: none;
		}
	}

	@media print {
		.frame {
			display: block;
			height: auto;
		}
	}
</style>
