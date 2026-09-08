import type { Project } from '$lib/types';
import { toPlain } from './core/markup';
import { data, period, reachable } from './profile-json';

// A hidden entry is unlisted, and exists at all only when another page links to it.
export const projects: Project[] = data.projects
	.map((p) => ({
		slug: p.x?.slug ?? p.id,
		name: toPlain(p.name),
		hidden: p.x?.hidden,
		oneLiner: p.x?.oneLiner ?? p.description ?? '',
		context: p.entity ?? '',
		period: period({ label: p.x?.periodLabel ?? p.dateLabel, start: p.startDate, end: p.endDate }),
		stack: [...p.keywords],
		description: p.description ?? '',
		// Markup kept: the page renders it, the text outputs strip it.
		highlights: p.highlights.filter((h) => !h.hidden).map((h) => h.text),
		links: p.x?.links ?? (p.url ? [{ label: 'source', href: p.url }] : [])
	}))
	.filter((p) => reachable('projects', p.slug, p.hidden));
