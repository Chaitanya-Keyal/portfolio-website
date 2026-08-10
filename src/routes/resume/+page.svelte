<script lang="ts">
	import { base } from '$app/paths';
	import Meta from '$lib/components/Meta.svelte';
	import { resumeText } from '$lib/data/resume-text';
	import { profile } from '$lib/data/profile';

	const text = resumeText();
</script>

<Meta
	title="resume — Chaitanya Keyal"
	description="Resume: {profile.summary}"
	path="/resume"
/>

<div class="resume reveal">
	<p class="meta-row">
		<!-- rel=external: the pdf is produced in CI, so the prerender crawler
		     must not try to follow this link at build time. -->
		<a href="{base}/resume.pdf" rel="external">pdf</a>
		<a href="{base}/resume.txt" data-sveltekit-reload>raw</a>
	</p>
	<pre>{text}</pre>
</div>

<style>
	.resume {
		max-width: 84ch;
	}

	.meta-row {
		display: flex;
		justify-content: flex-end;
		gap: 18px;
		font-size: 0.7812rem;
		margin-bottom: 14px;
	}

	/* The text is column-formatted for 80ch — never wrap it, scroll it. */
	pre {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--muted);
		overflow-x: auto;
		padding-bottom: 8px;
	}

	@media (max-width: 719px) {
		pre {
			font-size: 0.75rem;
		}
	}
</style>
