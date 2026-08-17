<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { listed } from '$lib/visibility';
	import { projects } from '$lib/data/projects';

	const shown = listed(projects);
</script>

<Meta page="/projects" description={`Selected projects: ${shown.map((p) => p.name).join(', ')}.`} />

<div class="index reveal">
	<h1>projects</h1>
	<ul>
		{#each shown as project (project.slug)}
			<li>
				<a href="{base}/projects/{project.slug}">{project.slug}</a>
				<span>{project.oneLiner}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.index {
		max-width: 72ch;
	}

	h1 {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--yellow);
		margin-bottom: 20px;
	}

	li {
		display: grid;
		grid-template-columns: 170px 1fr;
		gap: 16px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
	}
	li:first-of-type {
		border-top: 1px solid var(--border);
	}

	span {
		color: var(--muted);
	}

	@media (max-width: 719px) {
		li {
			grid-template-columns: 1fr;
			gap: 2px;
			padding: 10px 0;
		}
	}
</style>
