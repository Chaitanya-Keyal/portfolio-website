/** The one source of truth for every page: profile.json, edited in the resume
 * builder and committed here. The four data modules beside this file map it
 * onto the shapes the site has always used, so no page had to change. */
import raw from './profile.json';
import type { Profile } from './core/schema/types';
import { toPlain } from './core/markup';

export const data = raw as unknown as Profile;

// Fail the build, not the page, when the file is missing something every
// page relies on.
function need(cond: unknown, what: string) {
	if (!cond) throw new Error(`profile.json: ${what}`);
}
need(data.version === 1, 'expected version 1');
need(data.basics?.name, 'basics.name is required');
need(Array.isArray(data.work) && Array.isArray(data.projects), 'work and projects must be arrays');
need(!data.basics.phone, 'basics.phone must not be in the public profile');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2025-06` → `Jun 2025`; a bare year stays a year. */
export function month(iso: string | undefined): string {
	if (!iso) return '';
	const [y, m] = iso.split('-');
	return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/** The site's period wording: `Jun 2025 to present`, `2022 to 2023`, or just the year. */
export function period(start?: string, end?: string, label?: string): string {
	if (label) return label;
	if (start && end)
		return start.slice(0, 4) === end.slice(0, 4) && !start.includes('-')
			? start
			: `${month(start)} to ${month(end)}`;
	if (start) return `${month(start)} to present`;
	return month(end);
}

/** Every site path that some entry's "related" links point at. A hidden entry
 * is unlisted; it only gets a page at all when one of these links reaches it,
 * so hiding something nobody links to leaves it off the site entirely. */
export const linkedPaths: ReadonlySet<string> = new Set(
	[...data.work, ...data.volunteer, ...data.projects].flatMap((e) =>
		(e.x?.related ?? []).map((l) => l.href.replace(/\/+$/, ''))
	)
);

export function reachable(kind: 'work' | 'projects', slug: string, hidden: boolean | undefined) {
	return !hidden || linkedPaths.has(`/${kind}/${slug}`);
}

/** Bullet text as the site prints it: markup stripped. */
export function plain(text: string): string {
	return toPlain(text);
}
