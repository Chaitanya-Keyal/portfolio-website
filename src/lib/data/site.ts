import type { Page } from '$lib/types';
import { education } from './education';
import { experience } from './experience';
import { projects } from './projects';

/** Every navigable page — the one list behind the rail, the shell's filesystem,
 * the sitemap, the 404 suggestions and the per-page metadata. Sub-pages are
 * generated from the work and project entries, so adding one of those adds a
 * route, a rail link and a sitemap entry with it. */
export const pages: Page[] = [
	{
		name: 'home',
		path: '/',
		rail: '~',
		short: '~',
		title: 'Chaitanya Keyal — backend systems · AI agents · open source',
		description:
			'AI engineering intern and open-source developer — backend systems, AI agents, and Bitcoin tooling.',
		command: 'whoami'
	},
	{
		name: 'work',
		path: '/work',
		rail: 'work/',
		short: 'work',
		title: 'work',
		description: 'Work history: AI engineering, open-source Bitcoin development, backend systems.',
		command: 'ls work/'
	},
	...experience.map((e) => ({ name: e.slug, path: `/work/${e.slug}` })),
	{
		name: 'projects',
		path: '/projects',
		rail: 'projects/',
		short: 'proj',
		title: 'projects',
		description: 'Things I have built: Bitcoin tooling, AI agents, search, and campus software.',
		command: 'ls projects/'
	},
	...projects.map((p) => ({ name: p.slug, path: `/projects/${p.slug}` })),
	{
		name: 'education',
		path: '/education',
		rail: 'education',
		short: 'edu',
		title: 'education',
		description: `${education.degree}, ${education.schoolShort}, class of ${education.classOf}.`,
		command: 'cd education'
	},
	{
		name: 'resume',
		path: '/resume',
		rail: 'resume',
		short: 'cv',
		title: 'resume',
		description: 'Resume — plain text, PDF, or piped straight into your terminal.',
		command: 'cat resume/resume.txt'
	},
	{ name: 'resume.txt', path: '/resume/resume.txt', url: '/resume.txt', file: true },
	{ name: 'resume.pdf', path: '/resume/resume.pdf', url: '/resume.pdf', file: true, binary: true }
];
