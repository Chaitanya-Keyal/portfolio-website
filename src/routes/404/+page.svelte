<script lang="ts">
	import { base } from '$app/paths';
	import { pages } from '$lib/tui/registry';

	// Filled client-side: static hosting serves this page for every unknown URL.
	let missing = $state('/…');
	let suggestions = $state<{ name: string; path: string }[]>([]);

	function distance(a: string, b: string): number {
		const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
		for (let j = 1; j <= b.length; j++) rows[0][j] = j;
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				rows[i][j] = Math.min(
					rows[i - 1][j] + 1,
					rows[i][j - 1] + 1,
					rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
				);
			}
		}
		return rows[a.length][b.length];
	}

	$effect(() => {
		missing = location.pathname.slice(base.length) || '/';
		const sought = missing.replace(/^\/+/, '');
		suggestions = pages
			.map((p) => ({ ...p, score: distance(sought, p.path.replace(/^\/+/, '')) }))
			.filter((p) => p.score <= Math.max(3, sought.length / 2))
			.sort((a, b) => a.score - b.score)
			.slice(0, 3);
	});
</script>

<svelte:head>
	<title>404 — Chaitanya Keyal</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="notfound reveal">
	<p class="err glitch">zsh: no such file or directory: <span>{missing}</span></p>
	{#if suggestions.length > 0}
		<p class="hint">did you mean:</p>
		<ul>
			{#each suggestions as s (s.path)}
				<li><a href="{base}{s.path}">{s.path}</a></li>
			{/each}
		</ul>
	{:else}
		<ul>
			{#each pages.filter((p) => p.rail) as p (p.path)}
				<li><a href="{base}{p.path}">{p.path}</a></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.err {
		color: var(--red);
	}
	.err span {
		color: var(--fg);
	}

	.glitch {
		animation: glitch 0.9s steps(2, jump-none) 2;
	}

	@keyframes glitch {
		20% {
			text-shadow:
				-2px 0 var(--cyan),
				2px 0 var(--red);
			transform: translateX(1px);
		}
		40% {
			text-shadow:
				2px 0 var(--purple),
				-2px 0 var(--red);
			transform: translateX(-1px);
		}
		60% {
			text-shadow: none;
			transform: none;
		}
	}

	.hint {
		color: var(--muted);
		margin-top: 16px;
	}

	ul {
		margin-top: 8px;
	}
	li {
		padding: 2px 0;
	}
</style>
