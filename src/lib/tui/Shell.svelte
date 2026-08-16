<script lang="ts">
	import { base } from '$app/paths';
	import { host } from '$lib/data/terminal';
	import { run } from './commands';
	import { complete } from './completion';
	import type { Theme } from './theme';

	interface Props {
		cwd: string;
		/** Where the last navigation came from — OLDPWD, for `cd -`. */
		previous: string;
		/** Sitting under the page as a live session, rather than docked. */
		session: boolean;
		onnav: (to: string) => void;
		/** Hand a file to the browser — a PDF cannot be printed into a terminal. */
		onopen: (url: string) => void;
		ontheme: (theme: Theme) => void;
		oncrt: () => 'on' | 'off';
		onfocuschange: (focused: boolean) => void;
	}
	let { cwd, previous, session, onnav, onopen, ontheme, oncrt, onfocuschange }: Props = $props();

	interface Line {
		text: string;
		kind: 'cmd' | 'out' | 'err';
	}

	let lines = $state<Line[]>([]);
	let value = $state('');
	let input = $state<HTMLInputElement>();
	let scrollback = $state<HTMLElement>();
	let root = $state<HTMLElement>();

	const display = $derived(cwd === '/' ? '~' : `~${cwd}`);
	const ps1 = $derived(`${host}:${display}$`);

	const HISTORY_KEY = 'shell-history';
	let history: string[] = [];
	let historyIndex = -1;
	try {
		history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? '[]');
	} catch {
		history = [];
	}

	export function focusPrompt() {
		input?.focus();
	}

	/** The pane itself, which the layout resizes to move it between its
	 * docked and session positions. */
	export function element() {
		return root;
	}

	export function exec(command: string) {
		value = command;
		submit();
	}

	function append(...next: Line[]) {
		lines = [...lines, ...next].slice(-300);
	}

	let animation: ReturnType<typeof setInterval> | undefined;

	function stopAnimation() {
		if (animation) clearInterval(animation);
		animation = undefined;
	}

	/** Plays frames in place (each frame replaces the last), then cleans up —
	 * the train leaves the station and the scrollback stays tidy. */
	function animate(frames: string[][], interval: number) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const still = frames[Math.floor(frames.length / 2)];
			append(...still.map((text) => ({ text, kind: 'out' as const })));
			return;
		}
		const base = lines.length;
		let i = 0;
		const draw = () => {
			lines = [
				...lines.slice(0, base),
				...frames[i].map((text) => ({ text, kind: 'out' as const }))
			];
		};
		draw();
		animation = setInterval(() => {
			i += 1;
			if (i >= frames.length) {
				stopAnimation();
				lines = lines.slice(0, base);
				return;
			}
			draw();
		}, interval);
	}

	$effect(() => {
		void lines.length;
		if (scrollback) scrollback.scrollTop = scrollback.scrollHeight;
	});

	// The prompt is the last line, so it has to stay in view when the pane
	// changes size and not just when it prints. Sliding between docked and
	// session resizes it over a third of a second; without this the prompt
	// drifts up out of the scrollback and you have to go looking for it.
	$effect(() => {
		const el = scrollback;
		if (!el) return;
		const observer = new ResizeObserver(() => (el.scrollTop = el.scrollHeight));
		observer.observe(el);
		return () => observer.disconnect();
	});

	function remember(entry: string) {
		history = [...history.filter((h) => h !== entry), entry].slice(-50);
		try {
			sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
		} catch {}
	}

	async function submit() {
		stopAnimation();
		const entry = value.trim();
		value = '';
		historyIndex = -1;
		if (entry) remember(entry);
		append({ text: `${ps1} ${entry}`, kind: 'cmd' });
		const outcome = run(entry, cwd, previous);
		switch (outcome.kind) {
			case 'print':
				append(...outcome.lines.map((text) => ({ text, kind: 'out' as const })));
				break;
			case 'error':
				append(...outcome.lines.map((text) => ({ text, kind: 'err' as const })));
				break;
			case 'nav':
				if (outcome.clear) lines = [];
				onnav(outcome.to);
				break;
			case 'theme':
				ontheme(outcome.theme);
				append({ text: `theme set to ${outcome.theme}`, kind: 'out' });
				break;
			case 'crt':
				append({ text: `crt ${oncrt()}`, kind: 'out' });
				break;
			case 'cat': {
				try {
					const response = await fetch(base + outcome.url);
					const text = await response.text();
					append(...text.split('\n').map((line) => ({ text: line, kind: 'out' as const })));
				} catch {
					append({ text: `cat: ${outcome.url}: read error`, kind: 'err' });
				}
				break;
			}
			case 'open':
				append({ text: `opening ${outcome.url.split('/').pop()}…`, kind: 'out' });
				onopen(outcome.url);
				break;
			case 'animate':
				animate(outcome.frames, outcome.interval);
				break;
			case 'clear':
				lines = [];
				break;
			case 'none':
				break;
		}
	}

	function tab() {
		const completion = complete(value, cwd);
		value = completion.value;
		if (completion.options.length > 1) {
			append(
				{ text: `${ps1} ${value}`, kind: 'cmd' },
				{ text: completion.options.join('  '), kind: 'out' }
			);
		}
	}

	function onkeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
				void submit();
				return;
			case 'Escape':
				input?.blur();
				return;
			case 'Tab':
				event.preventDefault();
				tab();
				return;
			case 'ArrowUp':
				event.preventDefault();
				if (history.length === 0) return;
				historyIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
				value = history[historyIndex];
				return;
			case 'ArrowDown':
				event.preventDefault();
				if (historyIndex === -1) return;
				historyIndex = historyIndex + 1 >= history.length ? -1 : historyIndex + 1;
				value = historyIndex === -1 ? '' : history[historyIndex];
				return;
			case 'l':
				if (event.ctrlKey) {
					event.preventDefault();
					lines = [];
				}
				return;
		}
	}
</script>

<!-- Clicking the terminal focuses the prompt, like a real one — but never at
     the cost of a text selection someone just dragged, and never scrolling
     the pane to do it. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	bind:this={root}
	class="shell no-print"
	class:session
	onclick={() => {
		if (getSelection()?.isCollapsed) input?.focus({ preventScroll: true });
	}}
>
	<!-- Output and prompt flow together, terminal-style: the prompt is simply
	     the last line, and the whole thing scrolls pinned to the bottom. -->
	<div class="term" bind:this={scrollback} role="log" aria-live="polite">
		{#each lines as line, i (i)}
			<p class={line.kind}>{line.text}</p>
		{/each}
		<div class="promptline">
			<label for="prompt" class="ps1">
				<span class="user">{host}</span><span class="colon">:</span><span class="cwd"
					>{display}</span
				><span class="dollar">$</span>
			</label>
			<input
				id="prompt"
				bind:this={input}
				bind:value
				{onkeydown}
				onfocus={() => onfocuschange(true)}
				onblur={() => onfocuschange(false)}
				type="text"
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
				aria-label="Shell prompt — try `help`"
			/>
		</div>
	</div>
</div>

<style>
	.shell {
		grid-area: cmd;
		border: 1px solid var(--border);
		background: var(--bg);
		cursor: text;
		/* The layout animates this box's height to move it. Part-way through,
		   the terminal inside is taller than the box, so it has to clip.
		   There is deliberately no :focus-within ring: as a session this box is
		   half of one rectangle with the page, and lighting either half or the
		   whole page reads as a glitch. The caret and the status bar's mode say
		   where focus is. */
		overflow: hidden;
	}

	/* As a session it is the bottom half of one continuous box with the page
	   above it, so it drops the border they would otherwise share and fills
	   whatever height the column leaves it. Phones never get this: down there
	   the layout is one column and the shell stays docked. */
	@media (min-width: 720px) {
		.shell.session {
			display: flex;
			flex-direction: column;
			/* Transparent rather than removed: the border stays in the box model
			   so nothing shifts by a pixel, and a colour can be faded. It fades
			   at the end of the slide, because a seam that opens the moment the
			   terminal starts moving reads as a borderless box flying up the
			   page. Leaving home it snaps straight back — there is no
			   transition declared without this class — which is right, since it
			   is becoming a separate pane again. */
			border-top-color: transparent;
			transition: border-top-color 120ms linear calc(var(--slide) - 120ms);
			/* Anchored to the bottom of its row and sized explicitly rather than
			   stretched, so that animating its height moves the top edge and
			   leaves the bottom against the status bar — the same way it
			   behaves docked, where the row is content-sized. That symmetry is
			   what lets one property carry the whole transition. */
			align-self: end;
			height: 100%;
		}
	}

	.term {
		padding: 7px 20px;
		font-size: 0.8438rem;
		overflow-y: auto;
		/* Grows a line at a time with what it has printed, up to the height of
		   `help` — the longest thing the shell prints, so the output people
		   reach for first fits — after which the scrollback scrolls. */
		max-height: min(27.2em, 50dvh);
		/* Raw characters only, like a real shell: Fira Code's contextual
		   ligatures mis-shape around the input caret (`../` renders as `./`). */
		font-variant-ligatures: none;
		font-feature-settings: 'calt' 0;
	}
	/* A phone has no room to give half its screen to the terminal. */
	@media (max-width: 719px) {
		.term {
			max-height: min(27.2em, 32dvh);
		}
	}

	/* As a session it behaves like a real terminal instead: the prompt sits
	   directly under whatever has been printed, and the terminal is however
	   much room the column has left rather than a fixed slab. */
	@media (min-width: 720px) {
		.shell.session .term {
			flex: 1;
			min-height: 0;
			max-height: none;
			/* Same gutter as the page above, so the prompt lines up under the
			   output rather than sitting in its own indent. */
			padding-inline: var(--pane-pad);
		}
	}

	.term p {
		white-space: pre-wrap;
		word-break: break-word;
	}
	.cmd {
		color: var(--fg);
	}
	.out {
		color: var(--muted);
	}
	.err {
		color: var(--red);
	}

	.promptline {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.ps1 {
		white-space: nowrap;
		cursor: text;
	}
	.user {
		color: var(--green);
	}
	.colon,
	.dollar {
		color: var(--muted);
	}
	.cwd {
		color: var(--accent);
	}

	input {
		flex: 1;
		/* Inputs have an intrinsic ~230px minimum (size=20) that otherwise
		   forces the whole frame wider than a phone screen. */
		min-width: 0;
		width: 0;
		font: inherit;
		color: var(--fg);
		background: none;
		border: none;
		padding: 0;
		caret-color: var(--accent);
	}
	input:focus {
		outline: none;
	}

	/* Under 16px, iOS Safari zooms the page on focus. */
	@media (pointer: coarse) {
		input {
			font-size: 1rem;
		}
	}

	/* Phone: the full user@host prompt starves the input of width — show only
	   the cwd, ellipsized from the left so the deepest segment stays visible. */
	@media (max-width: 719px) {
		.user,
		.colon {
			display: none;
		}
		.cwd {
			display: inline-block;
			max-width: 34vw;
			overflow: hidden;
			text-overflow: ellipsis;
			direction: rtl;
			text-align: left;
			vertical-align: bottom;
		}
		/* A left-to-right mark, so the leading `~/` is not reordered by the rtl
		   above. It lives in CSS because an inline one ends up in anything
		   copied out of the terminal. */
		.cwd::before {
			content: '\200E';
		}
	}
</style>
