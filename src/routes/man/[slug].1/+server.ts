import { error } from '@sveltejs/kit';
import { allDocs, docBySlug } from '$lib/components/mandoc';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => allDocs.map(({ slug }) => ({ slug }));

/** These pages aren't just styled like man pages — `man -l` renders this. */
function roff(slug: string): string {
	const doc = docBySlug(slug);
	if (!doc) error(404, 'no such page');
	const period = doc.synopsis.find((s) => s.label === 'period')?.value ?? '';
	const category = doc.category[0] + doc.category.slice(1).toLowerCase();
	const lines = [
		`.TH "${doc.slug.toUpperCase()}" 1 "${period}" "okaybro.dev" "${category}"`,
		'.SH NAME',
		`${doc.slug} \\- ${doc.oneLiner}`,
		'.SH SYNOPSIS',
		doc.synopsis.map((s) => `${s.label}: ${s.value}`).join('; ') + '.',
		'.SH DESCRIPTION',
		doc.description,
		`.SH "${doc.didTitle.toUpperCase()}"`
	];
	for (const item of doc.did) {
		lines.push('.IP \\(bu 2', item);
	}
	if (doc.proof.length > 0) {
		lines.push('.SH PROOF');
		for (const link of doc.proof) {
			lines.push('.IP \\(bu 2', `${link.label}: ${link.href}`);
		}
	}
	const others = allDocs.filter((o) => o.category === doc.category && o.slug !== doc.slug);
	if (others.length > 0) {
		lines.push('.SH "SEE ALSO"', others.map((o) => `${o.slug}(1)`).join(', '));
	}
	const path = doc.category === 'PROJECTS' ? `/projects/${doc.slug}` : `/work/${doc.slug}`;
	lines.push('.SH "SEE ONLINE"', `https://okaybro.dev${path}`);
	return lines.join('\n') + '\n';
}

export const GET: RequestHandler = ({ params }) => {
	return new Response(roff(params.slug), {
		headers: { 'Content-Type': 'text/troff; charset=utf-8' }
	});
};
