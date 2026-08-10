// Copies the Fira Code subsets we actually use out of @fontsource so they can
// be preloaded from a stable path. Run once after install (`bun run fonts`).
import { copyFileSync, mkdirSync } from 'node:fs';

const weights = ['400', '500', '700'];
mkdirSync('static/fonts', { recursive: true });
for (const w of weights) {
	const file = `fira-code-latin-${w}-normal.woff2`;
	copyFileSync(`node_modules/@fontsource/fira-code/files/${file}`, `static/fonts/${file}`);
	console.log(`static/fonts/${file}`);
}
