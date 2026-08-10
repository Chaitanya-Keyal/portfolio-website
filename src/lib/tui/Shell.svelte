<script lang="ts">
	import { base } from '$app/paths';
	import { run, complete } from './registry';
	import type { Theme } from './theme';

	interface Props {
		cwd: string;
		onnav: (to: string) => void;
		ontheme: (theme: Theme) => void;
		oncrt: () => 'on' | 'off';
		onfocuschange: (focused: boolean) => void;
	}
	let { cwd, onnav, ontheme, oncrt, onfocuschange }: Props = $props();

	interface Line {
		text: string;
		kind: 'cmd' | 'out' | 'err';
	}

	let lines = $state<Line[]>([]);
	let value = $state('');
	let input = $state<HTMLInputElement>();
	let scrollback = $state<HTMLElement>();

	const display = $derived(cwd === '/' ? '~' : `~${cwd}`);
	const ps1 = $derived(`okaybro@dev:${display}$`);

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
			lines = [...lines.slice(0, base), ...frames[i].map((text) => ({ text, kind: 'out' as const }))];
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
		const outcome = run(entry, cwd);
		switch (outcome.kind) {
			case 'print':
				append(...outcome.lines.map((text) => ({ text, kind: 'out' as const })));
				break;
			case 'error':
				append(...outcome.lines.map((text) => ({ text, kind: 'err' as const })));
				break;
			case 'nav':
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
	class="shell no-print"
	class:open={lines.length > 0}
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
				<span class="user">okaybro@dev</span><span class="colon">:</span><span class="cwd">{'‎' + display}</span><span class="dollar">$</span>
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
	}
	.shell:focus-within {
		border-color: var(--accent);
	}

	.term {
		padding: 7px 20px;
		font-size: 13.5px;
		overflow-y: auto;
		/* Raw characters only, like a real shell: Fira Code's contextual
		   ligatures mis-shape around the input caret (`../` renders as `./`). */
		font-variant-ligatures: none;
		font-feature-settings: 'calt' 0;
	}
	/* Opens to one fixed height instead of growing line by line — the layout
	   shifts once; `clear` collapses it back. */
	.shell.open .term {
		height: min(320px, 36dvh);
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
			font-size: 16px;
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
	}
</style>
