<script lang="ts">
	import { base } from '$app/paths';
	import type { ManDoc } from './mandoc';

	interface Props {
		doc: ManDoc;
	}
	let { doc }: Props = $props();
</script>

<article class="reveal">
	<header aria-hidden="true">
		<span>{doc.slug.toUpperCase()}</span>
		<span>{doc.category}</span>
	</header>

	<section>
		<h1>name</h1>
		<p><strong>{doc.name}</strong> — {doc.oneLiner}</p>
	</section>

	<section>
		<h2>synopsis</h2>
		<dl>
			{#each doc.synopsis as row (row.label)}
				<dt>{row.label}</dt>
				<dd>{row.value}</dd>
			{/each}
		</dl>
	</section>

	<section>
		<h2>description</h2>
		<p>{doc.description}</p>
	</section>

	<section>
		<h2>{doc.didTitle}</h2>
		<ul>
			{#each doc.did as item (item)}
				<li>{item}</li>
			{/each}
		</ul>
	</section>

	{#if doc.proof.length > 0}
		<section>
			<h2>proof</h2>
			<ul class="proof">
				{#each doc.proof as link (link.href)}
					<li><a href={link.href} rel="me noopener">{link.label} ↗</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if doc.seeAlso.length > 0}
		<section>
			<h2>see also</h2>
			<p class="seealso">
				{#each doc.seeAlso as ref (ref.href)}
					<a href="{base}{ref.href}">{ref.label}</a>
				{/each}
			</p>
		</section>
	{/if}

	<p class="curl">also a man page: <code>curl okaybro.dev/man/{doc.slug}</code></p>
</article>

<style>
	article {
		max-width: 72ch;
	}

	header {
		display: flex;
		justify-content: space-between;
		color: var(--faint);
		font-size: 0.8125rem;
		margin-bottom: 28px;
	}

	section {
		margin-bottom: 26px;
	}

	h1,
	h2 {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--yellow);
		margin-bottom: 8px;
	}

	strong {
		color: var(--fg);
	}

	p,
	li,
	dd {
		color: var(--muted);
	}
	p strong {
		font-weight: 700;
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 2px 20px;
	}
	dt {
		color: var(--muted);
	}

	ul li {
		padding-left: 18px;
		position: relative;
		margin-bottom: 6px;
	}
	ul li::before {
		content: '•';
		position: absolute;
		left: 4px;
		color: var(--accent);
	}

	.proof li::before {
		content: '→';
	}

	.seealso {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.curl {
		margin-top: 36px;
		color: var(--muted);
		font-size: 0.7812rem;
	}
	.curl code {
		color: var(--fg);
		overflow-wrap: anywhere;
	}

	@media (max-width: 719px) {
		dl {
			grid-template-columns: 1fr;
			gap: 0;
		}
		dt {
			margin-top: 8px;
		}
		dd {
			margin-bottom: 2px;
		}
	}
</style>
