import type { Experience } from '$lib/types';
import { data, period, plain, reachable } from './profile-json';
import type { Engagement } from './core/schema/types';

/** Work and leadership entries alike: the site has one "work" lane. Each
 * organisation is one entry; its stints fold into one point list, newest
 * first, the way the site has always shown them. */
function toExperience(e: Engagement): Experience {
	const newest = e.positions[0];
	const starts = e.positions.map((p) => p.startDate).filter(Boolean) as string[];
	const ends = e.positions.map((p) => p.endDate);
	const open = ends.some((x) => !x);
	const start = starts.length ? starts.reduce((a, c) => (c < a ? c : a)) : undefined;
	const end = open
		? undefined
		: (ends.filter(Boolean) as string[]).reduce((a, c) => (c > a ? c : a), '');
	return {
		slug: e.x?.slug ?? e.id,
		org: plain(e.name),
		hidden: e.x?.hidden,
		role: newest?.position ?? '',
		period: period(start, end || undefined, e.x?.periodLabel),
		oneLiner: e.x?.oneLiner ?? '',
		description: e.description ?? '',
		stack: e.x?.stack ?? [],
		// Markup kept: the page renders it, the text outputs strip it.
		points: e.positions.flatMap((p) => p.highlights.filter((h) => !h.hidden).map((h) => h.text)),
		links: e.x?.links ?? [],
		related: e.x?.related ?? []
	};
}

// A hidden entry is unlisted, and exists at all only when another page links to it.
export const experience: Experience[] = [...data.work, ...data.volunteer]
	.map(toExperience)
	.filter((e) => reachable('work', e.slug, e.hidden));
