import { pages } from '$lib/data/site';
import { pageAt } from '$lib/content';
import type { Page } from '$lib/types';
import { docBySlug } from '$lib/text/mandoc';

/** The shell's filesystem is the route table: every page is a directory, every
 * `file: true` entry is a file, and paths resolve against it the way they would
 * against a real one. */

export { pageAt };

export function childrenOf(route: string): Page[] {
	const prefix = route === '/' ? '/' : `${route}/`;
	return pages.filter(
		(p) => p.path !== '/' && p.path.startsWith(prefix) && !p.path.slice(prefix.length).includes('/')
	);
}

/** Resolve a shell path argument against the working directory into a route. */
export function resolvePath(cwd: string, arg: string): string {
	const absolute = arg.startsWith('/') || arg.startsWith('~');
	const start = absolute ? [] : cwd.split('/').filter(Boolean);
	const rest = arg.replace(/^~\/?/, '').replace(/^\//, '');
	for (const segment of rest.split('/').filter(Boolean)) {
		if (segment === '.') continue;
		if (segment === '..') start.pop();
		else start.push(segment);
	}
	return '/' + start.join('/');
}

export function displayPath(route: string): string {
	return route === '/' ? '~' : `~${route}`;
}

/** The manual page for a route, if it has one. */
export function docAt(route: string) {
	return docBySlug(route.split('/').pop() ?? '');
}

export function treeLines(): string[] {
	const lines = ['.'];
	const tops = childrenOf('/');
	tops.forEach((top, ti) => {
		const lastTop = ti === tops.length - 1;
		const kids = childrenOf(top.path);
		lines.push(`${lastTop ? '└──' : '├──'} ${top.name}${!top.file && kids.length ? '/' : ''}`);
		kids.forEach((kid, ki) => {
			const branch = ki === kids.length - 1 ? '└──' : '├──';
			lines.push(`${lastTop ? '    ' : '│   '}${branch} ${kid.name}`);
		});
	});
	return lines;
}
