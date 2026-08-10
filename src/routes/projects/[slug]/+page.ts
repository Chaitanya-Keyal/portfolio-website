import { error } from '@sveltejs/kit';
import { projectBySlug, projects } from '$lib/data/projects';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => projects.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const project = projectBySlug(params.slug);
	if (!project) error(404, 'no such project');
	return { project };
};
