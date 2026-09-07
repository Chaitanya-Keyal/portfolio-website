import { describe, expect, it } from 'vitest';
import { resolve } from '$lib/data/core/resolve/resolve';
import type { Resume } from '$lib/data/core/schema/types';
import { data } from '$lib/data/profile-json';
import { profile } from '$lib/data/profile';
import composition from '$lib/data/resume.json';
import { resumeText } from './resume';

const resume = composition as unknown as Resume;
const { resolved, problems } = resolve(data, undefined, resume);
const text = resumeText();
const lines = text.split('\n');

describe('resume.txt', () => {
	// `curl | less` is 80 columns; a URL is the one unbreakable token allowed past it.
	it('fits 80 columns, except unbreakable lines', () => {
		for (const line of lines) {
			if (line.trim().split(/\s+/).length === 1) continue;
			expect(line.length, line).toBeLessThanOrEqual(80);
		}
	});

	it('opens with the name and closes with the site', () => {
		expect(lines[0].trim()).toBe(profile.name.toUpperCase());
		expect(text.trimEnd().split('\n').at(-1)).toBe(`  more at ${profile.site}`);
	});

	it('prints the composition sections in its order, uppercased and ruled', () => {
		const titles = lines.filter((_, i) => lines[i + 1]?.startsWith('─'));
		expect(titles).toHaveLength(resolved.sections.length);
		resolved.sections.forEach((section, i) => {
			const title = titles[i];
			expect(title).toBe(title.toUpperCase());
			if (section.title) expect(title).toBe(section.title.toUpperCase());
			else if (section.type !== 'work') expect(title).toBe(section.type.toUpperCase());
			else expect(title).toBe('EXPERIENCE');
		});
	});

	it('lists every entry the composition resolves, with every one of its bullets', () => {
		for (const section of resolved.sections)
			for (const item of section.items) {
				const name = item.kind === 'skills' || item.kind === 'simple' ? item.name : item.title;
				expect(text).toContain(name);
				for (const bullet of item.bullets) expect(text).toContain(bullet.text.slice(0, 30));
			}
	});

	it('resolves every reference the composition makes', () => {
		expect(problems.map((p) => p.message)).toEqual([]);
	});
});
