import { error } from '@sveltejs/kit';
import { allDocs, docBySlug, manLines } from '$lib/components/mandoc';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => allDocs.map(({ slug }) => ({ slug }));

/** Pre-rendered man page: `curl -L okaybro.dev/man/seedsigner` needs no pipe.
 * The roff source lives one extension away at /man/<slug>.1. */
export const GET: RequestHandler = ({ params }) => {
	const doc = docBySlug(params.slug);
	if (!doc) error(404, 'no such page');
	const text = [
		...manLines(doc),
		'',
		`roff source: curl -L okaybro.dev/man/${doc.slug}.1 | man -l -`,
		''
	].join('\n');
	return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
