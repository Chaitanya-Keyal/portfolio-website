<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { formatDate, posts } from '$lib/blog';
	import { listed } from '$lib/visibility';

	const shown = listed(posts);
</script>

<Meta page="/blog" />

<div class="index reveal">
	<h1>blog</h1>
	{#if shown.length === 0}
		<p class="empty">(nothing published yet)</p>
	{:else}
		<ul>
			{#each shown as post (post.slug)}
				<li>
					<a href="{base}/blog/{post.slug}">{post.slug}</a>
					<div>
						<p class="title">{post.title}</p>
						<time class="date" datetime={post.date}>{formatDate(post.date)}</time>
						<p class="line">{post.summary}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
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
		margin-bottom: 26px;
	}

	.title {
		color: var(--fg);
	}

	/* Its own line rather than trailing the summary, where it landed at
	   whatever column the text happened to wrap on. Every date now starts at
	   the same place, so the list can be scanned down. */
	.date {
		display: block;
		color: var(--faint);
		font-size: 0.8125rem;
		margin: 2px 0 4px;
	}

	.line {
		color: var(--muted);
	}

	.empty {
		color: var(--muted);
	}

	@media (max-width: 719px) {
		li {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
