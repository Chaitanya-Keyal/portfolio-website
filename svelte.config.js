import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		paths: {
			// Empty at okaybro.dev; '/portfolio-website' when serving from
			// project Pages without the custom domain (set by CI).
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			entries: ['*', '/404']
		}
	}
};
