import { pages } from '$lib/data/site';
import { pageAt } from '$lib/content';
import { listed } from '$lib/visibility';
import type { Page } from '$lib/types';
import { docBySlug } from '$lib/text/mandoc';

/** The shell's filesystem is the route table: every page is a directory, every
 * `file: true` entry is a file, and paths resolve against it the way they would
 * against a real one. */

export { pageAt };

export function childrenOf(route: string, all = false): Page[] {
	const prefix = route === '/' ? '/' : `${route}/`;
	const kids = pages.filter(
		(p) => p.path !== '/' && p.path.startsWith(prefix) && !p.path.slice(prefix.length).includes('/')
	);
	return all ? kids : listed(kids);
}

/** How an entry is written in a listing. Hidden ones get a leading dot, the way
 * a real shell shows them, so that what you read is also what you can type. */
export function displayName(page: Page): string {
	return page.hidden ? `.${page.name}` : page.name;
}

/** Whether a listing writes this entry with a trailing slash. The slash means
 * there is something inside, not merely that the entry is a page: every page is
 * a place `cd` can go, so marking them all would say nothing, and it would
 * imply `cat` will not work on a leaf when it will. Honours the same `all` the
 * listing itself used, so the mark never advertises hidden children. */
export function isBranch(page: Page, all = false): boolean {
	return !page.file && childrenOf(page.path, all).length > 0;
}

/** Resolve a shell path argument against the working directory into a route. */
export function resolvePath(cwd: string, arg: string): string {
	const absolute = arg.startsWith('/') || arg.startsWith('~');
	const start = absolute ? [] : cwd.split('/').filter(Boolean);
	const rest = arg.replace(/^~\/?/, '').replace(/^\//, '');
	for (const segment of rest.split('/').filter(Boolean)) {
		if (segment === '.') continue;
		if (segment === '..') start.pop();
		// `.` and `..` are already gone, so a leading dot here is the display
		// spelling of a hidden entry. Routes and URLs keep the undotted name.
		else start.push(segment.startsWith('.') ? segment.slice(1) : segment);
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

export function treeLines(all = false): string[] {
	const lines = ['.'];
	const tops = childrenOf('/', all);
	tops.forEach((top, ti) => {
		const lastTop = ti === tops.length - 1;
		const kids = childrenOf(top.path, all);
		lines.push(`${lastTop ? '└──' : '├──'} ${displayName(top)}${isBranch(top, all) ? '/' : ''}`);
		kids.forEach((kid, ki) => {
			const branch = ki === kids.length - 1 ? '└──' : '├──';
			lines.push(`${lastTop ? '    ' : '│   '}${branch} ${displayName(kid)}`);
		});
	});
	return lines;
}
