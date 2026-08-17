<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { listed } from '$lib/visibility';
	import { experience } from '$lib/data/experience';

	const shown = listed(experience);
</script>

<Meta page="/work" />

<div class="index reveal">
	<h1>work</h1>
	<ul>
		{#each shown as job (job.slug)}
			<li>
				<a href="{base}/work/{job.slug}">{job.slug}</a>
				<div>
					<p class="org">{job.org}</p>
					<p class="line">{job.oneLiner} · <span class="period">{job.period}</span></p>
				</div>
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
		grid-template-columns: 190px 1fr;
		gap: 16px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	li:first-of-type {
		border-top: 1px solid var(--border);
	}

	.org {
		color: var(--fg);
	}

	.line {
		color: var(--muted);
		font-size: 0.8438rem;
	}

	.period {
		color: var(--faint);
	}

	@media (max-width: 719px) {
		li {
			grid-template-columns: 1fr;
			gap: 2px;
			padding: 12px 0;
		}
	}
</style>
