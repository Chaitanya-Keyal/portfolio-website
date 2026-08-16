<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { pages } from '$lib/data/site';

	const sections = pages.filter((p) => p.rail);

	function children(section: (typeof pages)[number]) {
		return pages.filter((p) => !p.rail && !p.file && p.path.startsWith(`${section.path}/`));
	}

	function current(path: string): boolean {
		return page.url.pathname === base + path || page.url.pathname === `${base}${path}/`;
	}
</script>

<nav class="pane" aria-label="Site">
	<div class="scroll">
		<ul>
			{#each sections as section (section.path)}
				<li>
					<a
						href="{base}{section.path}"
						data-sveltekit-reload={section.file ? true : undefined}
						aria-current={current(section.path) ? 'page' : undefined}
					>
						<span class="full">{section.rail}</span><span class="compact">{section.short}</span>
					</a>
				</li>
				{#each children(section) as child (child.path)}
					<li class="child">
						<a href="{base}{child.path}" aria-current={current(child.path) ? 'page' : undefined}>
							{child.name}
						</a>
					</li>
				{/each}
			{/each}
		</ul>
	</div>
</nav>

<style>
	nav {
		grid-area: rail;
		display: flex;
		flex-direction: column;
	}

	.scroll {
		flex: 1;
		overflow-y: auto;
		padding: 18px 0 12px;
	}

	a {
		display: block;
		padding: 3px 20px;
		color: var(--muted);
	}
	a:hover {
		color: var(--fg);
		text-decoration: none;
		background: var(--bg-hl);
	}
	/* Inverted video, like a real TUI selection. */
	a[aria-current='page'] {
		color: var(--bg);
		background: var(--accent);
		font-weight: 500;
		text-shadow: none;
	}

	.child a {
		padding-left: 38px;
		font-size: 0.8125rem;
	}

	.compact {
		display: none;
	}

	/* Phone: the rail becomes a bottom tab bar; project links live in the page. */
	@media (max-width: 719px) {
		.scroll {
			padding: 0;
			overflow: visible;
		}
		.child {
			display: none;
		}
		ul {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 1fr;
		}
		a,
		a[aria-current='page'] {
			text-align: center;
			padding: 12px 0;
			font-size: 0.8125rem;
			overflow: hidden;
		}
		.full {
			display: none;
		}
		.compact {
			display: inline;
		}
	}
</style>
