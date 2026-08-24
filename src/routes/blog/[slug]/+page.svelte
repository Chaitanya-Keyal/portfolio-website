<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';
	import { formatDate } from '$lib/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const Body = $derived(post.render);
</script>

<Meta page="/blog/{post.slug}" title={post.title} description={post.summary} />

<article class="post reveal">
	<header>
		<h1>{post.title}</h1>
		<p class="meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>{#if post.hidden}<span class="draft">
					· draft</span
				>{/if}
		</p>
	</header>

	<div class="body">
		<Body />
	</div>
</article>

<style>
	.post {
		max-width: 72ch;
	}

	h1 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--yellow);
		margin-bottom: 6px;
	}

	.meta {
		color: var(--muted);
		margin-bottom: 28px;
	}

	.draft {
		color: var(--red);
	}

	/* mdsvex emits plain markup, so the prose is styled from here rather than
	   from the post, which keeps a post to its words. */
	.body :global(h2) {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--yellow);
		margin: 32px 0 12px;
	}

	.body :global(h3) {
		font-weight: 700;
		color: var(--fg);
		margin: 24px 0 8px;
	}

	.body :global(p) {
		margin-bottom: 14px;
	}

	.body :global(ul),
	.body :global(ol) {
		margin: 0 0 14px 0;
		padding-left: 0;
		list-style: none;
	}

	.body :global(li) {
		position: relative;
		padding-left: 20px;
		margin-bottom: 6px;
	}

	.body :global(ul) :global(li)::before {
		content: '-';
		position: absolute;
		left: 4px;
		color: var(--muted);
	}

	.body :global(ol) {
		counter-reset: item;
	}

	.body :global(ol) :global(li) {
		counter-increment: item;
	}

	.body :global(ol) :global(li) {
		/* Wide enough for a two-digit marker: at 20px, "10." ran into the text. */
		padding-left: 32px;
	}

	.body :global(ol) :global(li)::before {
		content: counter(item) '.';
		position: absolute;
		left: 0;
		width: 24px;
		text-align: right;
		color: var(--muted);
	}

	.body :global(a) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.body :global(code) {
		color: var(--green);
	}

	.body :global(pre) {
		border: 1px solid var(--border);
		padding: 12px 14px;
		margin-bottom: 16px;
		overflow-x: auto;
	}

	.body :global(pre) :global(code) {
		color: inherit;
	}

	.body :global(blockquote) {
		border-left: 2px solid var(--border);
		padding-left: 14px;
		color: var(--muted);
		margin-bottom: 14px;
	}

	.body :global(hr) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 28px 0;
	}

	.body :global(img) {
		max-width: 100%;
	}

	.body :global(table) {
		border-collapse: collapse;
		margin-bottom: 16px;
		display: block;
		overflow-x: auto;
	}

	.body :global(th),
	.body :global(td) {
		border: 1px solid var(--border);
		padding: 4px 10px;
		text-align: left;
	}
</style>
