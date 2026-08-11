import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Where the build stamp is expressed. CI runs in UTC, and so does
// toISOString(), which reads a day behind for the whole Indian evening.
const ZONE = 'Asia/Kolkata';
const ZONE_LABEL = 'IST';

function commitHash(): string {
	try {
		return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return 'dev';
	}
}

/** Build time as `YYYY-MM-DD HH:MM IST`. sv-SE is the locale whose short date
 * and time formats are already ISO-shaped. */
function builtAt(): string {
	const stamp = new Date().toLocaleString('sv-SE', {
		timeZone: ZONE,
		dateStyle: 'short',
		timeStyle: 'short'
	});
	return `${stamp} ${ZONE_LABEL}`;
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__COMMIT__: JSON.stringify(commitHash()),
		__BUILT__: JSON.stringify(builtAt())
	}
});
