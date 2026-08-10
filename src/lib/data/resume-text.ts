import { profile } from './profile';
import { experience } from './experience';
import { projects } from './projects';

const WIDTH = 80;

function rule(char = '─'): string {
	return char.repeat(WIDTH);
}

function wrap(text: string, indent = 2): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let line = ' '.repeat(indent);
	for (const word of words) {
		if (line.length + word.length + 1 > WIDTH) {
			lines.push(line);
			line = ' '.repeat(indent) + word;
		} else {
			line = line.trimEnd() === '' ? line + word : `${line} ${word}`;
		}
	}
	lines.push(line);
	return lines;
}

/** The one resume: feeds /resume (page), /resume.txt (raw), and `cat`. */
export function resumeText(): string {
	const lines: string[] = [];
	const center = (text: string) => ' '.repeat(Math.max(0, Math.floor((WIDTH - text.length) / 2))) + text;

	lines.push(center(profile.name.toUpperCase()));
	lines.push(center(`${profile.contact.email} · ${profile.contact.github}`));
	lines.push(center(profile.status));
	lines.push('');
	lines.push('EDUCATION');
	lines.push(rule());
	lines.push(`  ${profile.education.school}`);
	lines.push(`  ${profile.education.degree} · class of ${profile.education.classOf}`);
	lines.push('');
	lines.push('EXPERIENCE');
	lines.push(rule());
	for (const job of experience) {
		lines.push(`  ${job.org} — ${job.role} (${job.period})`);
		for (const point of job.points) lines.push(...wrap(`* ${point}`, 4));
		lines.push('');
	}
	lines.push('PROJECTS');
	lines.push(rule());
	for (const project of projects) {
		lines.push(`  ${project.name} — ${project.oneLiner}`);
		lines.push(`    ${project.proof[0].href}`);
	}
	lines.push('');
	lines.push('SKILLS');
	lines.push(rule());
	for (const [group, items] of Object.entries(profile.skills)) {
		lines.push(...wrap(`${group}: ${items.join(', ')}`, 2));
	}
	lines.push('');
	lines.push(`  more at ${profile.site}`);
	return lines.join('\n') + '\n';
}
