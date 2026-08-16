import { error } from '@sveltejs/kit';
import { experienceBySlug } from '$lib/content';
import { experience } from '$lib/data/experience';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => experience.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const job = experienceBySlug(params.slug);
	if (!job) error(404, 'no such entry');
	return { job };
};
