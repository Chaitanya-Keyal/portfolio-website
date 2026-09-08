import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import raw from './profile.json';
import schema from './profile.schema.json';
import { experience } from './experience';
import { projects } from './projects';
import { profile } from './profile';
import { education } from './education';

/** profile.json is edited elsewhere and committed here; these checks fail the
 * build before a bad file reaches the pages. */
describe('profile.json', () => {
	it('matches the published schema', () => {
		const ajv = new Ajv2020({ allErrors: true, strict: false });
		const validate = ajv.compile(schema);
		const ok = validate(raw);
		expect(validate.errors ?? []).toEqual([]);
		expect(ok).toBe(true);
	});

	it('keeps the phone number out of the public file', () => {
		expect('phone' in raw.basics).toBe(false);
	});

	it('has unique slugs across work and projects', () => {
		const slugs = [...experience.map((e) => e.slug), ...projects.map((p) => p.slug)];
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('points related links at real pages', () => {
		const pages = new Set([
			...experience.map((e) => `/work/${e.slug}`),
			...projects.map((p) => `/projects/${p.slug}`)
		]);
		for (const e of experience) for (const r of e.related) expect(pages.has(r.href)).toBe(true);
		for (const r of education.campus) if (r.link) expect(pages.has(r.link)).toBe(true);
	});

	it('maps the basics the pages print', () => {
		expect(profile.name).toBeTruthy();
		expect(profile.contact.github).toMatch(/^https:\/\/github\.com\//);
		expect(Object.keys(profile.skills).length).toBeGreaterThan(0);
		expect(education.classOf).toBeGreaterThan(2000);
	});
});
