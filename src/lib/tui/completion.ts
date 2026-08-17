import { allDocs } from '$lib/text/mandoc';
import { ALIASES, commands } from './commands';
import { childrenOf, displayName, isBranch, resolvePath } from './filesystem';
import { themes } from './theme';

/* ---------- tab completion, shell-style ---------- */

export interface Completion {
	/** Full input with the last token completed (or extended to the common prefix). */
	value: string;
	/** When ambiguous: candidates to print, like bash's double-tab. */
	options: string[];
}

function candidatesFor(command: string, cwd: string, partial: string): string[] {
	if (command === 'theme') return themes.filter((t) => t.startsWith(partial));
	if (command === 'man') {
		return allDocs.filter((d) => d.slug.startsWith(partial)).map((d) => d.slug);
	}
	if (!['cd', 'ls', 'cat', 'open'].includes(command)) return [];
	// Path completion: split the partial into dirname + basename.
	const slash = partial.lastIndexOf('/');
	const dirPart = slash === -1 ? '' : partial.slice(0, slash + 1);
	const basePart = slash === -1 ? partial : partial.slice(slash + 1);
	const baseRoute = dirPart ? resolvePath(cwd, dirPart) : cwd;
	// Exactly bash's rule for dotfiles: hidden entries appear only once the dot
	// has been typed, and they complete under the same dotted name a listing
	// shows. The trailing slash marks what has something inside it.
	const all = basePart.startsWith('.');
	return childrenOf(baseRoute, all)
		.filter((p) => displayName(p).startsWith(basePart))
		.map((p) => dirPart + displayName(p) + (isBranch(p, all) ? '/' : ''));
}

function commonPrefix(options: string[]): string {
	let prefix = options[0];
	for (const option of options.slice(1)) {
		while (!option.startsWith(prefix)) prefix = prefix.slice(0, -1);
	}
	return prefix;
}

export function complete(input: string, cwd: string): Completion {
	const tokens = input.split(/\s+/);
	const partial = tokens[tokens.length - 1];
	const head = tokens.slice(0, -1);
	const candidates =
		head.length === 0
			? commands.filter((c) => !c.hidden && c.name.startsWith(partial)).map((c) => c.name)
			: candidatesFor((ALIASES[head[0]] ?? head[0]).split(/\s+/)[0], cwd, partial);
	if (candidates.length === 0) return { value: input, options: [] };
	if (candidates.length === 1) {
		const completed = candidates[0] + (head.length === 0 ? ' ' : '');
		return { value: [...head, completed].join(' '), options: [] };
	}
	const prefix = commonPrefix(candidates);
	const value = prefix.length > partial.length ? [...head, prefix].join(' ') : input;
	return { value, options: candidates };
}
