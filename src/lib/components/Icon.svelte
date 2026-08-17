<script lang="ts">
	interface Props {
		/** Which glyph to draw. */
		name: 'external' | 'contrast';
	}
	let { name }: Props = $props();
</script>

<!--
	Small inline icons, drawn rather than borrowed from a font so they sit on the
	baseline at a predictable size instead of wherever a glyph happens to land.
	They inherit colour and scale with the text, and are hidden from screen
	readers: every one of them sits beside a real label.
-->
<svg
	class="icon"
	viewBox="0 0 16 16"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'external'}
		<!-- A link leaving the site: an arrow escaping an open-cornered box. -->
		<path d="M9.5 3h3.5v3.5" />
		<path d="M13 3 7.5 8.5" />
		<path d="M12 10v2.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5H6" />
	{:else if name === 'contrast'}
		<!-- Light and dark: a circle with one half filled. -->
		<circle cx="8" cy="8" r="5.5" />
		<path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" stroke="none" />
	{/if}
</svg>

<style>
	.icon {
		width: 1em;
		height: 1em;
		/* Sits on the text baseline rather than the line box. */
		vertical-align: -0.125em;
		flex-shrink: 0;
	}
</style>
