<script lang="ts">
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
		<a href="/resume.txt" data-sveltekit-reload>raw</a>
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
		font-size: 12.5px;
		margin-bottom: 14px;
	}

	/* The text is column-formatted for 80ch — never wrap it, scroll it. */
	pre {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--muted);
		overflow-x: auto;
		padding-bottom: 8px;
	}

	@media (max-width: 719px) {
		pre {
			font-size: 12px;
		}
	}
</style>
