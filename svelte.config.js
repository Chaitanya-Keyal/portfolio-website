import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
export default {
	// Posts are .md files under src/lib/data/blog, so that writing one means
	// writing prose rather than editing a data structure. mdsvex compiles them
	// at build time, which is why it is a devDependency and the site still
	// ships with nothing at runtime.
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		// smartypants is on by default and rewrites plain apostrophes, quotes and
		// dashes into their typographic forms. The site deliberately sticks to
		// characters you can type, so a post ships the punctuation it was written
		// with.
		mdsvex({ extensions: ['.md'], smartypants: false })
	],
	kit: {
		adapter: adapter(),
		paths: {
			// Empty at the custom domain; '/portfolio-website' when serving from
			// project Pages without the custom domain (set by CI).
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			entries: ['*', '/404']
		}
	}
};
