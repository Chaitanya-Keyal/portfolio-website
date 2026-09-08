import type { Experience } from '$lib/types';
import { toPlain } from './core/markup';
import type { Engagement } from './core/schema/types';
import { data, period, reachable } from './profile-json';

/** Work and leadership entries alike: the site has one "work" lane. Each
 * organisation is one entry; its stints fold into one point list, newest
 * first, and span one period from the earliest start to the latest end. */
function toExperience(e: Engagement): Experience {
	const starts = e.positions.flatMap((p) => p.startDate ?? []).sort();
	const ends = e.positions.map((p) => p.endDate);
	return {
		slug: e.x?.slug ?? e.id,
		org: toPlain(e.name),
		hidden: e.x?.hidden,
		role: e.positions[0]?.position ?? '',
		period: period({
			label: e.x?.periodLabel,
			start: starts[0],
			// Any stint still open keeps the whole entry open.
			end: ends.every(Boolean) ? ends.sort().at(-1) : undefined
		}),
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
