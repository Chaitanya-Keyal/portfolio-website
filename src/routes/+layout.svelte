<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
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
	let shell = $state<{
		focusPrompt: () => void;
		exec: (command: string) => void;
		element: () => HTMLElement | undefined;
	}>();

	// App-internal path with the deployment base stripped — the shell's cwd.
	const cwd = $derived(page.url.pathname.slice(base.length).replace(/\/$/, '') || '/');
	const mode = $derived(booting ? 'boot' : shellFocused ? 'insert' : 'normal');
	// Home is a live session: the fetch output sits at the top with the prompt
	// under it. Everywhere else the shell docks to the bottom of the frame.
	const atHome = $derived(cwd === '/');

	/** Lets the frame paint again. Held back from before the first paint. */
	function reveal() {
		delete document.documentElement.dataset.boot;
	}

	onMount(() => {
		theme = currentTheme();
		// Whether to boot was settled before the first paint, by the head script
		// on the home page — deciding it here would let the page paint and then
		// drop the overlay over it a moment later. That script only exists on
		// the home page, so the flag implies we are on it.
		if (document.documentElement.dataset.boot === 'pending') booting = true;
		else reveal();
	});

	function finishBoot() {
		if (!booting) return;
		booting = false;
		reveal();
		poweringOn = true;
	}

	// Sliding the terminal between session and docked. Both states share a
	// bottom edge — the status bar — so the whole move is one number: how tall
	// the terminal is. Growing it walks its top edge up over the page, shrinking
	// it walks back down. The column never changes width, so nothing inside is
	// ever rewrapped, and docked the page above resizes in step, which keeps the
	// seam between them continuous instead of snapping.
	const SLIDE_MS = 340; // keep in step with --slide in app.css
	let slide: Animation | undefined;
	let from: number | undefined;

	// OLDPWD for `cd -`. Recorded on any navigation, not just `cd`, so it also
	// takes you back from wherever a link in the rail dropped you.
	let previous = $state('');

	// The height is measured before the new page renders. A running slide is
	// included, since getBoundingClientRect() reports the height it is
	// animating through — interrupting halfway then carries on from where it
	// visually is rather than jumping.
	beforeNavigate(() => {
		previous = cwd;
		from = shell?.element()?.getBoundingClientRect().height;
	});

	// The scroll container is #main, not the window, so SvelteKit's own
	// post-navigation scroll reset never reaches it — without this, the next
	// page opens at the previous page's scroll offset.
	afterNavigate(() => {
		document.getElementById('main')?.scrollTo(0, 0);

		const el = shell?.element();
		const start = from;
		from = undefined;
		if (!el || start === undefined) return;

		slide?.cancel(); // drop the animated height, so the rect below is the real one
		const end = el.getBoundingClientRect().height;
		// Same height (most navigations) or motion turned down: nothing to do.
		if (Math.abs(end - start) < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		slide = el.animate([{ height: `${start}px` }, { height: `${end}px` }], {
			duration: SLIDE_MS,
			easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)'
		});
	});

	// keepFocus: navigating from the prompt (`cd`, `man`) must not kick you out
	// of the terminal mid-session. Files never arrive here — `cat` opens those.
	function navigate(to: string) {
		goto(base + to, { keepFocus: true });
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
			// `i` too: the status bar advertises NORMAL/INSERT, so the vim
			// reflex should work. These open the prompt without typing
			// themselves into it.
			case ':':
			case '/':
			case 'i':
				event.preventDefault();
				shell?.focusPrompt();
				break;
			case '?':
				event.preventDefault();
				shell?.exec('help');
				break;
			default:
				// Anything else printable: the page is a terminal with a prompt
				// on it, so typing should land there rather than nowhere. No
				// preventDefault — focusing during keydown lets the character
				// through to the input it just moved to.
				if (event.key.length === 1) shell?.focusPrompt();
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

<div
	class="frame"
	class:power-on={poweringOn}
	data-home={atHome || undefined}
	onanimationend={() => (poweringOn = false)}
>
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
		{previous}
		session={atHome}
		onnav={navigate}
		onopen={(url) => (location.href = base + url)}
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
		/* The rail runs the full height so the shell shares a column with main:
		   the two shell positions then differ only in where the row starts, and
		   nothing about it ever changes width. */
		grid-template-rows: 1fr auto auto;
		grid-template-areas:
			'rail main'
			'rail cmd'
			'status status';
	}

	/* Home is one terminal, not two panes stacked: the fetch output is
	   content-height, the session takes the rest of the column, and the seam
	   between them — gap and shared border — goes, so it reads as a single
	   view you just ran neofetch in. minmax(0, auto) rather than auto so that
	   on a short window main gives way and scrolls itself, instead of pushing
	   the prompt off the bottom.

	   Only above the phone breakpoint: down there the layout is one column and
	   the shell stays docked. */
	@media (min-width: 720px) {
		.frame[data-home] {
			grid-template-rows: minmax(0, auto) 1fr auto;
			row-gap: 0;
		}
		/* The other half of the seam, on the same clock as the shell's. */
		.frame[data-home] .pane-main {
			border-bottom-color: transparent;
			transition: border-bottom-color 120ms linear calc(var(--slide) - 120ms);
		}
		/* The status bar keeps the gap that row-gap: 0 just took away. */
		.frame[data-home] :global(footer) {
			margin-top: 8px;
		}
		/* The prompt is the next line after the output, not a new section. */
		.frame[data-home] main {
			padding-bottom: 10px;
		}
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
		padding: 30px var(--pane-pad) 48px;
	}
	main:focus {
		outline: none;
	}

	/* Phone: one column, the rail is a tab bar at the bottom, and the shell
	   stays docked — the fetch output is taller than the screen here, so there
	   is no room to sit a prompt under it. */
	@media (max-width: 719px) {
		.frame {
			padding: 8px;
			gap: 6px;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto auto auto;
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
