import { listed } from '$lib/visibility';
import type { Page } from '$lib/types';
import { education } from './education';
import { profile } from './profile';
import { experience } from './experience';
import { projects } from './projects';

/** Every navigable page: the one list behind the rail, the shell's filesystem,
 * the sitemap, the 404 suggestions and the per-page metadata. Sub-pages are
 * generated from the work and project entries, so adding one of those adds a
 * route, a rail link and a sitemap entry with it. */
export const pages: Page[] = [
	{
		name: 'home',
		path: '/',
		rail: '~',
		short: '~',
		title: profile.name + ': ' + profile.tagline,
		description: profile.summary,
		command: 'whoami'
	},
	{
		name: 'work',
		path: '/work',
		rail: 'work/',
		short: 'work',
		title: 'work',
		description:
			'Work history: ' +
			listed(experience)
				.map((e) => e.org)
				.join(', ') +
			'.',
		command: 'ls work/'
	},
	...experience.map((e) => ({ name: e.slug, path: `/work/${e.slug}`, hidden: e.hidden })),
	{
		name: 'projects',
		path: '/projects',
		rail: 'projects/',
		short: 'proj',
		title: 'projects',
		description: 'Things I have built: Bitcoin tooling, AI agents, autonomous systems, and more.',
		command: 'ls projects/'
	},
	...projects.map((p) => ({ name: p.slug, path: `/projects/${p.slug}`, hidden: p.hidden })),
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
		description: 'Resume in plain text, PDF, or piped straight into your terminal.',
		command: 'cat resume/resume.txt'
	},
	{ name: 'resume.txt', path: '/resume/resume.txt', url: '/resume.txt', file: true },
	{ name: 'resume.pdf', path: '/resume/resume.pdf', url: '/resume.pdf', file: true, binary: true }
];
