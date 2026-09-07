import type { Project } from '$lib/types';
import { data, period } from './profile-json';

export const projects: Project[] = data.projects.map((p) => ({
	slug: p.x?.slug ?? p.id,
	name: p.name,
	hidden: p.x?.hidden,
	oneLiner: p.x?.oneLiner ?? p.description ?? '',
	context: p.entity ?? '',
	period: period(p.startDate, p.endDate, p.x?.periodLabel ?? p.dateLabel),
	stack: [...p.keywords],
	description: p.description ?? '',
	// Markup kept: the page renders it, the text outputs strip it.
	highlights: p.highlights.filter((h) => !h.hidden).map((h) => h.text),
	links: p.x?.links ?? (p.url ? [{ label: 'source', href: p.url }] : [])
}));
