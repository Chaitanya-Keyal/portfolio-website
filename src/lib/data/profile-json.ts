/** The one source of truth for every page: profile.json, edited in the resume
 * builder and committed here. The data modules beside this file map it onto
 * the shapes the pages consume (see $lib/types). */
import raw from './profile.json';
import { formatRange, type RangeOptions } from './core/latex/dates';
import type { DateRange } from './core/resolve/types';
import type { Profile } from './core/schema/types';

export const data = raw as unknown as Profile;

// Fail the build, not the page, when the file is missing something every
// page relies on.
function need(cond: unknown, what: string) {
	if (!cond) throw new Error(`profile.json: ${what}`);
}
need(data.version === 1, 'expected version 1');
need(data.basics?.name, 'basics.name is required');
need(
	[data.work, data.volunteer, data.projects, data.skills, data.education].every(Array.isArray),
	'work, volunteer, projects, skills and education must be arrays'
);
need(!data.basics.phone, 'basics.phone must not be in the public profile');

const RANGE: RangeOptions = { style: 'MMM yyyy', separator: ' to ', present: 'present' };

/** The site's period wording: `Jun 2025 to present`, `2022 to 2023`, a lone
 * `Aug 2026` for a one-month stint, or the label the library set. */
export function period(d: DateRange): string {
	return formatRange(d, RANGE);
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
