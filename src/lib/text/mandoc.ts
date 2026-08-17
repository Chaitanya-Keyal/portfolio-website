import { experience } from '$lib/data/experience';
import { projects } from '$lib/data/projects';
import type { Experience, ProofLink, Project } from '$lib/types';

/** One shape for every man-page-style document on the site. */
export interface ManDoc {
	slug: string;
	category: 'PROJECTS' | 'WORK';
	name: string;
	oneLiner: string;
	synopsis: { label: string; value: string }[];
	description: string;
	didTitle: string;
	did: string[];
	proof: ProofLink[];
	seeAlso: { label: string; href: string }[];
}

export function projectDoc(project: Project): ManDoc {
	const index = projects.findIndex((p) => p.slug === project.slug);
	const neighbours = [projects[index - 1], projects[index + 1]].filter(Boolean);
	return {
		slug: project.slug,
		category: 'PROJECTS',
		name: project.name,
		oneLiner: project.oneLiner,
		synopsis: [
			{ label: 'context', value: project.context },
			{ label: 'period', value: project.period },
			{ label: 'stack', value: project.stack.join(' · ') }
		],
		description: project.description,
		didTitle: 'what i did',
		did: project.highlights,
		proof: project.proof,
		seeAlso: neighbours.map((n) => ({ label: n.slug, href: `/projects/${n.slug}` }))
	};
}

export function workDoc(job: Experience): ManDoc {
	return {
		slug: job.slug,
		category: 'WORK',
		name: job.org,
		oneLiner: job.oneLiner,
		synopsis: [
			{ label: 'role', value: job.role },
			{ label: 'period', value: job.period },
			{ label: 'stack', value: job.stack.join(' · ') }
		],
		description: job.description,
		didTitle: 'what i did',
		did: job.points,
		proof: job.proof,
		seeAlso: job.related
	};
}

export const allDocs: ManDoc[] = [...projects.map(projectDoc), ...experience.map(workDoc)];

export function docBySlug(slug: string): ManDoc | undefined {
	return allDocs.find((d) => d.slug === slug);
}

export function docPath(doc: ManDoc): string {
	return doc.category === 'PROJECTS' ? `/projects/${doc.slug}` : `/work/${doc.slug}`;
}

const WIDTH = 78;

/** Wraps at WIDTH with a hanging indent, man-page style. */
function wrap(text: string, first: string, indent: string): string[] {
	const lines: string[] = [];
	let line = first;
	let empty = true;
	for (const word of text.split(/\s+/)) {
		const candidate = empty ? line + word : `${line} ${word}`;
		if (candidate.length > WIDTH && !empty) {
			lines.push(line);
			line = indent + word;
		} else {
			line = candidate;
		}
		empty = false;
	}
	lines.push(line);
	return lines;
}

/** Rendered man-page text, used by the shell's `man` and /man/<slug>. */
export function manLines(doc: ManDoc): string[] {
	return [
		`${doc.slug.toUpperCase()}${' '.repeat(Math.max(1, 40 - doc.slug.length))}${doc.category}`,
		'',
		'NAME',
		...wrap(`${doc.name} - ${doc.oneLiner}`, '  ', '  '),
		'',
		'SYNOPSIS',
		...doc.synopsis.map((s) => `  ${s.label.padEnd(9)}${s.value}`),
		'',
		'DESCRIPTION',
		...wrap(doc.description, '  ', '  '),
		'',
		doc.didTitle.toUpperCase(),
		...doc.did.flatMap((d) => wrap(d, '  • ', '    ')),
		// Wrapped like everything else: a long URL is one unbreakable word, so
		// it drops to its own indented line rather than running past 80.
		...(doc.proof.length > 0
			? ['', 'PROOF', ...doc.proof.flatMap((p) => wrap(`→ ${p.label}: ${p.href}`, '  ', '    '))]
			: [])
	];
}
