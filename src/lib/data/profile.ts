import { data } from './profile-json';

const b = data.basics;
const find = (network: string) =>
	b.profiles.find((p) => p.network.toLowerCase() === network.toLowerCase())?.url ?? '';

/** Skill groups the site lists, keyed for the home page rows. Groups marked
 * hidden in the library are resume-only. */
const skills: Record<string, string[]> = {};
for (const g of data.skills) {
	if (g.x?.hidden) continue;
	skills[(g.x?.key as string | undefined) ?? g.id] = [...g.keywords];
}

export const profile = {
	name: b.name,
	handle: b.x?.handle ?? '',
	site: b.url ?? '',
	tagline: b.x?.tagline ?? b.label ?? '',
	summary: b.summary ?? '',
	role: b.x?.role ?? b.label ?? '',
	// Shown on home and every lane page; keep in sync with the resume.
	status: b.x?.status ?? '',
	contact: {
		email: b.email ?? '',
		github: find('GitHub'),
		linkedin: find('LinkedIn')
	},
	repo: b.x?.repo ?? '',
	skills
};
