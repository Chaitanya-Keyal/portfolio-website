// Copies the Fira Code subsets we use out of @fontsource so they can be
// preloaded from a stable path.
//
// The "latin" subset stops at U+02BB and has none of the block characters the
// pixel portrait and boot banner are drawn with. "symbols2" carries those, and
// crucially it is the same build as the latin files — identical units-per-em
// and advance width — so block art lines up with the text instead of coming
// out slightly wider.
//
// Run once after install: `bun run fonts`.
import { copyFileSync, mkdirSync } from 'node:fs';

const files = [
	'fira-code-latin-400-normal.woff2',
	'fira-code-latin-500-normal.woff2',
	'fira-code-latin-700-normal.woff2',
	'fira-code-symbols2-400-normal.woff2'
];

mkdirSync('static/fonts', { recursive: true });
for (const file of files) {
	copyFileSync(`node_modules/@fontsource/fira-code/files/${file}`, `static/fonts/${file}`);
	console.log(`static/fonts/${file}`);
}
