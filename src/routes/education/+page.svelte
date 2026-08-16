<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { education } from '$lib/data/education';
</script>

<Meta page="/education" />

<article class="reveal">
	<header aria-hidden="true">
		<span>EDUCATION</span>
		<span>MISC</span>
	</header>

	<section>
		<h1>name</h1>
		<p><strong>{education.school}</strong> — {education.summary}, class of {education.classOf}</p>
	</section>

	<section>
		<h2>synopsis</h2>
		<dl>
			<dt>degree</dt>
			<dd>{education.degree}</dd>
			<dt>minor</dt>
			<dd>{education.minor}</dd>
			<dt>graduating</dt>
			<dd>{education.classOf}</dd>
		</dl>
	</section>

	<section>
		<h2>description</h2>
		<p>{education.description}</p>
	</section>

	<section>
		<h2>selected coursework</h2>
		<ul>
			{#each education.coursework as course (course)}
				<li>{course}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>on campus</h2>
		<ul>
			{#each education.campus as role (role.link)}
				<li>{role.text} <a href="{base}{role.link}">{role.linkText}</a>.</li>
			{/each}
		</ul>
	</section>
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
	dd,
	dt {
		color: var(--muted);
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 2px 20px;
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
</style>
