import { error } from '@sveltejs/kit';
import { postBySlug, posts } from '$lib/blog';
import type { EntryGenerator, PageLoad } from './$types';

// Every post, drafts included: a draft is unlisted, not unbuilt, so its URL
// works for anyone it is handed to.
export const entries: EntryGenerator = () => posts.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const post = postBySlug(params.slug);
	if (!post) error(404, 'no such post');
	return { post };
};
