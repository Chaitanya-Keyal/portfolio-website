import { education } from '$lib/data/education';
import { profile } from '$lib/data/profile';
import { projects } from '$lib/data/projects';

export const prerender = true;

function build(): string {
	return [
		`# ${profile.name}`,
		'',
		`> ${profile.summary}`,
		'',
		`${profile.role}. ${education.degree}, ${education.schoolShort}, class of ${education.classOf}. ${profile.status}.`,
		'',
		'## Projects',
		'',
		...projects.map((p) => `- [${p.name}](${profile.site}/projects/${p.slug}): ${p.oneLiner}`),
		'',
		'## Links',
		'',
		`- [Work history](${profile.site}/work)`,
		`- [Plain-text resume](${profile.site}/resume.txt)`,
		`- [GitHub](${profile.contact.github})`,
		''
	].join('\n');
}

export function GET(): Response {
	return new Response(build(), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
