<script lang="ts">
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { profile } from '$lib/data/profile';
	import Icon from './Icon.svelte';

	interface Props {
		children: Snippet;
		/** Switch this post back into the terminal the rest of the site is. */
		onterminal: () => void;
	}
	let { children, onterminal }: Props = $props();
</script>

<!-- A post arrives as a link, usually from someone who has never seen this
     site. Handing them the whole terminal makes them navigate an interface
     to read a paragraph, so a post is a document first, with the way back
     kept small and in the corner. -->
<div class="reader">
	<header>
		<a class="home" href="{base}/">{profile.name.toLowerCase()}</a>
		<nav>
			<a href="{base}/blog">blog</a>
			<button type="button" onclick={onterminal}>
				<Icon name="terminal" />terminal
			</button>
		</nav>
	</header>

	<main id="main" tabindex="-1">
		{@render children()}
	</main>

	<footer>
		<a href="{base}/">{profile.site.replace(/^https?:\/\//, '')}</a>
		<span class="sep">·</span>
		<a href={profile.contact.github} rel="me noopener">github</a>
	</footer>
</div>

<style>
	.reader {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		/* Prose wants a little more air than a terminal does. */
		line-height: 1.7;
		padding: 0 24px;
	}

	header,
	footer,
	main {
		width: 100%;
		max-width: 74ch;
		margin: 0 auto;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 0;
		border-bottom: 1px solid var(--border);
		margin-bottom: 40px;
	}

	.home {
		color: var(--fg);
		font-weight: 700;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	nav a,
	button {
		color: var(--muted);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}

	.home:hover,
	nav a:hover,
	button:hover {
		color: var(--accent);
	}

	main {
		flex: 1;
		outline: none;
	}

	footer {
		display: flex;
		gap: 10px;
		padding: 40px 0 28px;
		margin-top: 56px;
		border-top: 1px solid var(--border);
		color: var(--muted);
	}

	footer a {
		color: var(--muted);
	}

	footer a:hover {
		color: var(--accent);
	}

	.sep {
		color: var(--faint);
	}

	@media (max-width: 719px) {
		.reader {
			padding: 0 16px;
		}

		header {
			margin-bottom: 28px;
		}
	}
</style>
