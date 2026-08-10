<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { profile } from '$lib/data/profile';

	const edu = profile.education;
</script>

<Meta
	title="education — Chaitanya Keyal"
	description="{edu.degree}, {edu.school}, class of {edu.classOf}."
	path="/education"
/>

<article class="reveal">
	<header aria-hidden="true">
		<span>EDUCATION</span>
		<span>MISC</span>
	</header>

	<section>
		<h1>name</h1>
		<p><strong>{edu.school}</strong> — dual degree, class of {edu.classOf}</p>
	</section>

	<section>
		<h2>synopsis</h2>
		<dl>
			<dt>degree</dt>
			<dd>{edu.degree}</dd>
			<dt>minor</dt>
			<dd>{edu.minor}</dd>
			<dt>graduating</dt>
			<dd>{edu.classOf}</dd>
		</dl>
	</section>

	<section>
		<h2>description</h2>
		<p>
			A dual-degree program: engineering and mathematics in parallel. The CS half pays the
			bills; the math half explains why the CS half works.
		</p>
	</section>

	<section>
		<h2>selected coursework</h2>
		<ul>
			{#each edu.coursework as course (course)}
				<li>{course}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>on campus</h2>
		<ul>
			<li>Core member of cruX, the programming club — see <a href="{base}/work/crux">crux</a>.</li>
			<li>Undergraduate TA at the Central Analytical Laboratory, maintaining <a href="{base}/projects/onlinecal">onlinecal</a>.</li>
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
		font-size: 13px;
		margin-bottom: 28px;
	}

	section {
		margin-bottom: 26px;
	}

	h1,
	h2 {
		font-size: 13px;
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
