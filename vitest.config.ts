import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Separate from vite.config.ts on purpose: these tests cover the shell's pure
// logic, which needs no SvelteKit plugin, no browser and no DOM — just the
// $lib alias the source imports resolve through.
export default defineConfig({
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
