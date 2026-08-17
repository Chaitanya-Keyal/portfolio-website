import { describe, expect, it } from 'vitest';
import { allDocs, docBySlug, docPath, manLines } from './mandoc';

describe('man pages', () => {
	it('renders one for every project and role', () => {
		expect(allDocs.length).toBeGreaterThan(0);
		for (const doc of allDocs) expect(docBySlug(doc.slug)).toBe(doc);
	});

	it('has no entry for an unknown slug', () => {
		expect(docBySlug('nope')).toBeUndefined();
	});

	it('files each page under the section it belongs to', () => {
		for (const doc of allDocs) {
			const prefix = doc.category === 'PROJECTS' ? '/projects/' : '/work/';
			expect(docPath(doc)).toBe(`${prefix}${doc.slug}`);
		}
	});

	// The whole point of the roff rendering is that it survives a plain
	// terminal, and `curl | less` is 80 columns wide. A bare URL is exempt:
	// it is one unbreakable token, and wrapping it would corrupt it.
	it('wraps every line inside 80 columns, except unbreakable ones', () => {
		for (const doc of allDocs) {
			for (const line of manLines(doc)) {
				if (line.trim().split(/\s+/).length === 1) continue;
				expect(line.length, `${doc.slug}: ${line}`).toBeLessThanOrEqual(80);
			}
		}
	});

	it('opens with a header naming the page and its section', () => {
		for (const doc of allDocs) {
			const [header] = manLines(doc);
			expect(header).toContain(doc.slug.toUpperCase());
			expect(header).toContain(doc.category);
		}
	});

	it('has slugs that are URL-safe', () => {
		for (const doc of allDocs) expect(doc.slug).toMatch(/^[a-z0-9-]+$/);
	});
});
