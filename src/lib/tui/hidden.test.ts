import { describe, expect, it, vi } from 'vitest';

/** A hidden project has to disappear from every listing at once while staying
 * fully reachable, so this file stands up a fake one and checks both halves.
 * The mock is why these live apart from commands.test.ts: it replaces the data
 * module for the whole file. */
vi.mock('$lib/data/projects', () => ({
	projects: [
		{
			slug: 'shown',
			name: 'Shown',
			oneLiner: 'a listed project',
			context: '',
			period: '',
			stack: [],
			description: 'listed',
			highlights: [],
			links: [{ label: 'source', href: 'https://example.com/shown' }]
		},
		{
			slug: 'secret',
			name: 'Secret',
			hidden: true,
			oneLiner: 'an unlisted project',
			context: '',
			period: '',
			stack: [],
			description: 'unlisted',
			highlights: [],
			links: [{ label: 'source', href: 'https://example.com/secret' }]
		}
	]
}));

vi.mock('$lib/data/experience', () => ({
	experience: [
		{
			slug: 'openco',
			org: 'OpenCo',
			role: 'Engineer',
			period: '2025',
			oneLiner: 'a listed role',
			description: 'listed',
			stack: [],
			points: [],
			links: [],
			related: []
		},
		{
			slug: 'quietco',
			org: 'QuietCo',
			hidden: true,
			role: 'Engineer',
			period: '2025',
			oneLiner: 'an unlisted role',
			description: 'unlisted',
			stack: [],
			points: [],
			links: [],
			related: []
		}
	]
}));

const { pageAt } = await import('$lib/content');
const { listed } = await import('$lib/visibility');
const { pages } = await import('$lib/data/site');
const { childrenOf, treeLines } = await import('./filesystem');
const { run } = await import('./commands');
const { complete } = await import('./completion');
const { resumeText } = await import('$lib/text/resume');

const linesOf = (out: ReturnType<typeof run>) =>
	out.kind === 'print' ? out.lines.join('\n') : `<${out.kind}>`;

describe('listed', () => {
	it('drops hidden items and keeps the rest in order', () => {
		expect(listed([{ hidden: true }, {}, { hidden: false }])).toEqual([{}, { hidden: false }]);
	});
});

describe('a hidden project', () => {
	it('is still a real page, so a direct link resolves', () => {
		expect(pageAt('/projects/secret')).toBeDefined();
		expect(pages.some((p) => p.path === '/projects/secret')).toBe(true);
	});

	it('is left out of a bare listing but shown by ls -a', () => {
		expect(linesOf(run('ls projects', '/'))).toContain('shown');
		expect(linesOf(run('ls projects', '/'))).not.toContain('secret');
		expect(linesOf(run('ls -a projects', '/'))).toContain('secret');
		expect(linesOf(run('ls -la projects', '/'))).toContain('secret');
	});

	it('is left out of tree but shown by tree -a', () => {
		expect(treeLines().join('\n')).not.toContain('secret');
		expect(treeLines(true).join('\n')).toContain('secret');
		expect(linesOf(run('tree -a', '/'))).toContain('secret');
	});

	it('can still be cd-ed into and read with man', () => {
		expect(run('cd projects/secret', '/')).toEqual({ kind: 'nav', to: '/projects/secret' });
		expect(run('man secret', '/').kind).toBe('print');
	});

	it('is listed with a leading dot, and answers to that spelling', () => {
		expect(linesOf(run('ls -a projects', '/'))).toContain('.secret');
		expect(treeLines(true).join('\n')).toContain('.secret');
		// What you read is what you can type, but the route keeps the real name.
		expect(run('cd projects/.secret', '/')).toEqual({ kind: 'nav', to: '/projects/secret' });
		expect(run('cd projects/secret', '/')).toEqual({ kind: 'nav', to: '/projects/secret' });
	});

	it('completes once you start typing it, but never on a bare tab', () => {
		expect(complete('ls projects/', '/').options).not.toContain('projects/.secret');
		expect(complete('ls projects/.sec', '/').value).toBe('ls projects/.secret');
		// Bash's rule: without the dot, a hidden entry is not a candidate.
		expect(complete('ls projects/sec', '/').options).not.toContain('projects/.secret');
	});

	it('is revealed by `la`, since the alias now carries the flag', () => {
		expect(linesOf(run('la', '/projects'))).toContain('.secret');
		expect(linesOf(run('ls', '/projects'))).not.toContain('.secret');
		expect(linesOf(run('lla', '/projects'))).toContain('.secret');
		// `l` and `dir` are plain `ls`, so they still hide.
		expect(linesOf(run('l', '/projects'))).not.toContain('.secret');
		expect(linesOf(run('dir', '/projects'))).not.toContain('.secret');
	});

	it('stays out of the resume', () => {
		expect(resumeText()).toContain('Shown');
		expect(resumeText()).not.toContain('Secret');
	});
});

describe('childrenOf', () => {
	it('hides by default and reveals when asked', () => {
		const names = (all?: boolean) => childrenOf('/projects', all).map((p) => p.name);
		expect(names()).toEqual(['shown']);
		expect(names(true)).toEqual(['shown', 'secret']);
	});
});

describe('a hidden experience entry', () => {
	it('behaves exactly like a hidden project', () => {
		expect(pageAt('/work/quietco')).toBeDefined();
		expect(linesOf(run('ls work', '/'))).not.toContain('quietco');
		expect(linesOf(run('ls -a work', '/'))).toContain('quietco');
		expect(run('cd work/quietco', '/')).toEqual({ kind: 'nav', to: '/work/quietco' });
		expect(run('man quietco', '/').kind).toBe('print');
	});

	it('stays out of the resume and the work page description', async () => {
		expect(resumeText()).toContain('OpenCo');
		expect(resumeText()).not.toContain('QuietCo');
		const { pages } = await import('$lib/data/site');
		const work = pages.find((p) => p.path === '/work');
		expect(work?.description).toContain('OpenCo');
		expect(work?.description).not.toContain('QuietCo');
	});
});
