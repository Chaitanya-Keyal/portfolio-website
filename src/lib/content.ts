import { experience } from '$lib/data/experience';
import { profile } from '$lib/data/profile';
import { projects } from '$lib/data/projects';
import { pages } from '$lib/data/site';
import type { Experience, Page, Project } from '$lib/types';

/** Ways of asking questions about what is in data/. The data files themselves
 * hold nothing but the information, so that editing content never means
 * reading around code. */

export function projectBySlug(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}

export function experienceBySlug(slug: string): Experience | undefined {
	return experience.find((e) => e.slug === slug);
}

export function pageAt(route: string): Page | undefined {
	return pages.find((p) => p.path === route);
}

/** Where a page or file is actually served, which is its shell path unless it
 * says otherwise. */
export function urlOf(page: Page): string {
	return page.url ?? page.path;
}

/** The site without its protocol, for places that print a URL as plain text. */
export const domain = profile.site.replace(/^https?:\/\//, '');
