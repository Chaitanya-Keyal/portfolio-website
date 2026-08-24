import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatDate, posts } from './blog';
import { pages } from './data/site';

/** Posts are files on disk rather than a data structure, so these cover the
 * machinery around them: the section they hang off, the punctuation they are
 * allowed to keep, and how a date is printed. */
describe('the blog section', () => {
	it('exists as a page', () => {
		expect(pages.some((p) => p.path === '/blog')).toBe(true);
	});

	it('does not expand under the rail, unlike work and projects', () => {
		// Post slugs are long and say less than their titles do, so the rail
		// stops at the folder. The shell still lists them.
		expect(pages.find((p) => p.path === '/blog')?.collapsed).toBe(true);
		expect(pages.find((p) => p.path === '/projects')?.collapsed).toBeUndefined();
	});
});

describe('post punctuation', () => {
	// mdsvex ships smartypants on, which turns a plain ' into a curly one and
	// -- into a dash. The site keeps to characters you can type, so the config
	// turns it off and this notices if that ever comes back.
	it('leaves the config with smart typography off', () => {
		// Read rather than imported: importing it would pull the config into the
		// typecheck graph, which is not this test's business.
		expect(readFileSync('svelte.config.js', 'utf8')).toContain('smartypants: false');
	});

	it('has no typographic characters in any post source', () => {
		for (const post of posts) {
			const source = readFileSync(`src/lib/data/blog/${post.slug}.md`, 'utf8');
			const found = source.match(/[\u2018\u2019\u201c\u201d\u2013\u2014\u2026]/g);
			expect(found, `${post.slug}.md contains ${found?.join(' ')}`).toBeNull();
		}
	});
});

describe('read mode', () => {
	const css = () => readFileSync('src/app.css', 'utf8');

	// Read mode has to opt out of the CRT overlay as one of the conditions on
	// the rule itself. A separate override has to beat three :not()s, which a
	// first attempt at this did not, and the scanlines stayed on.
	it('is excluded inside the CRT rules rather than overriding them', () => {
		const rules = css().match(/^:root:not\(\[data-crt.*$/gm) ?? [];
		expect(rules.length).toBe(2);
		for (const rule of rules) expect(rule).toContain(":not([data-view='reader'])");
	});

	it('never turns the CRT off for real, so leaving a post restores it', () => {
		// Only the `:crt` command may write the stored preference.
		const layout = readFileSync('src/routes/+layout.svelte', 'utf8');
		const writes = layout.match(/localStorage\.setItem\('crt'/g) ?? [];
		expect(writes).toHaveLength(1);
		expect(readFileSync('src/lib/components/Reader.svelte', 'utf8')).not.toContain('crt');
	});
});

describe('formatDate', () => {
	it('prints an ISO day the way the rest of the site writes dates', () => {
		expect(formatDate('2026-08-17')).toBe('17 Aug 2026');
	});

	it('does not drift a day in a timezone behind UTC', () => {
		// Parsed as UTC on purpose: `new Date('2026-01-01')` in a negative
		// offset would otherwise print 31 Dec.
		expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
	});
});
