import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

// Separate from vite.config.ts on purpose: these tests cover the shell's pure
// logic, which needs no SvelteKit plugin, no browser and no DOM. The Svelte
// plugin is here only because the page list is derived partly from the blog,
// and the posts are .md files that mdsvex has to compile before anything can
// import them. It picks up the preprocessor from svelte.config.js.
export default defineConfig({
	plugins: [svelte()],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	},
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	}
});
