<script lang="ts">
	interface Props {
		theme: string;
		mode: string;
		onthemecycle: () => void;
	}
	let { theme, mode, onthemecycle }: Props = $props();
</script>

<footer class="no-print">
	<span class="mode" class:alt={mode !== 'normal'}>{mode}</span>
	<span class="meta">
		<button type="button" class="theme" onclick={onthemecycle} title="switch theme">
			◐ {theme}
		</button>
		<span class="sep" aria-hidden="true">·</span>
		<span class="stamp">{__COMMIT__} · {__BUILT__}</span>
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
		font-size: 12.5px;
		white-space: nowrap;
	}

	/* vim-style mode segment */
	.mode {
		background: var(--accent);
		color: var(--bg);
		font-weight: 700;
		font-size: 11px;
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

	/* Phone: mode + theme only — the build stamp is desktop furniture. */
	@media (max-width: 719px) {
		.meta .sep,
		.stamp {
			display: none;
		}
	}
</style>
