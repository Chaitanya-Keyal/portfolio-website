import { formatDate, formatRange } from '$lib/data/core/latex/dates';
import { toPlain } from '$lib/data/core/markup';
import { resolve } from '$lib/data/core/resolve/resolve';
import type { DateRange, ResolvedItem, ResolvedSection } from '$lib/data/core/resolve/types';
import type { Resume, SectionType } from '$lib/data/core/schema/types';
import { profile } from '$lib/data/profile';
import { data } from '$lib/data/profile-json';
import composition from '$lib/data/resume.json';

const WIDTH = 80;

/** The composition the resume builder exported: which entries and bullets
 * print, in what order, with which titles. Same file the PDF is built from. */
const resume = composition as unknown as Resume;

/** Section titles when the composition does not name one. */
const TITLES: Record<SectionType, string> = {
	work: 'EXPERIENCE',
	volunteer: 'VOLUNTEERING',
	education: 'EDUCATION',
	projects: 'PROJECTS',
	skills: 'SKILLS',
	awards: 'AWARDS',
	certificates: 'CERTIFICATES',
	publications: 'PUBLICATIONS',
	languages: 'LANGUAGES',
	interests: 'INTERESTS',
	custom: 'OTHER'
};

function rule(char = '─'): string {
	return char.repeat(WIDTH);
}

/** Wraps at WIDTH; every line gets `indent` spaces, the first one `first`
 * instead when given (a hanging indent). */
function wrap(text: string, indent = 2, first = ' '.repeat(indent)): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let line = first;
	let empty = true;
	for (const word of words) {
		if (!empty && line.length + word.length + 1 > WIDTH) {
			lines.push(line);
			line = ' '.repeat(indent) + word;
		} else {
			line = empty ? line + word : `${line} ${word}`;
		}
		empty = false;
	}
	lines.push(line);
	return lines;
}

/** The site's period wording: `Jun 2025 to present`, `2022 to 2023`, a lone
 * date when the range starts and ends on it, or the label the library set. */
function when(d: DateRange): string {
	if (d.label === undefined && d.start && d.start === d.end) return formatDate(d.start, 'MMM yyyy');
	return formatRange(d, { style: 'MMM yyyy', separator: ' to ', present: 'present' });
}

/** `a | b (dates)`, dropping whichever parts are empty. */
function heading(main: string, detail: string | undefined, dates: string): string {
	const left = detail ? `${main} | ${detail}` : main;
	return dates ? `${left} (${dates})` : left;
}

function itemLines(item: ResolvedItem, section: ResolvedSection): string[] {
	const lines: string[] = [];
	switch (item.kind) {
		case 'subheading':
			if (section.type === 'education') {
				// School on its own line, degree and year beneath it.
				lines.push(...wrap(item.title, 4, '  '));
				const dates = when(item.dates);
				const degree = [item.subtitle, dates].filter(Boolean).join(' · ');
				if (degree) lines.push(...wrap(degree, 4, '  '));
			} else {
				lines.push(...wrap(heading(item.title, item.subtitle, when(item.dates)), 4, '  '));
			}
			break;
		case 'project':
			lines.push(...wrap(heading(item.title, item.keywords.join(', '), when(item.dates)), 4, '  '));
			if (item.url) lines.push(`    ${item.url}`);
			break;
		case 'skills':
			lines.push(...wrap(`${item.name}: ${item.keywords.join(', ')}`, 2));
			break;
		case 'award':
			lines.push(...wrap(heading(item.title, item.awarder, when(item.dates)), 4, '  '));
			if (item.summary) lines.push(...wrap(toPlain(item.summary), 4));
			break;
		case 'simple':
			lines.push(...wrap(heading(item.name, item.detail, when(item.dates)), 4, '  '));
			if (item.url) lines.push(`    ${item.url}`);
			break;
	}
	if (item.description) lines.push(...wrap(toPlain(item.description), 4));
	for (const bullet of item.bullets) lines.push(...wrap(`* ${toPlain(bullet.text)}`, 4));
	return lines;
}

/** Contacts on as few centred lines as fit, `a · b · c`. */
function packed(parts: string[]): string[] {
	const lines: string[] = [];
	let line = '';
	for (const part of parts) {
		const joined = line ? `${line} · ${part}` : part;
		if (line && joined.length > WIDTH) {
			lines.push(line);
			line = part;
		} else {
			line = joined;
		}
	}
	if (line) lines.push(line);
	return lines;
}

/** The one resume: feeds /resume (page), /resume.txt (raw), and `cat`. It
 * prints the composition in resume.json, so it lists exactly what the PDF
 * does; entries the library no longer has are reported by resolve() and
 * skipped. */
export function resumeText(): string {
	const { resolved } = resolve(data, undefined, resume);
	const lines: string[] = [];
	const center = (text: string) =>
		' '.repeat(Math.max(0, Math.floor((WIDTH - text.length) / 2))) + text;

	lines.push(center(toPlain(resolved.header.name).toUpperCase()));
	for (const line of packed(resolved.header.contacts.map((c) => c.text))) lines.push(center(line));
	if (resolved.header.tagline) lines.push(center(toPlain(resolved.header.tagline)));
	if (profile.status) lines.push(center(profile.status));
	lines.push('');

	for (const section of resolved.sections) {
		lines.push((section.title ?? TITLES[section.type] ?? section.type).toUpperCase());
		lines.push(rule());
		for (const item of section.items) {
			lines.push(...itemLines(item, section));
			// Bullets make an entry a block; blocks get air between them.
			if (item.bullets.length || item.description) lines.push('');
		}
		if (lines[lines.length - 1] !== '') lines.push('');
	}

	lines.push(`  more at ${profile.site}`);
	return lines.join('\n') + '\n';
}
