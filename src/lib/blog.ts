import type { Component } from 'svelte';
import type { PostMeta } from './types';

/** Posts are .md files under data/blog, picked up at build time. Adding one is
 * dropping a file in that folder: the route, the rail entry, the shell path,
 * the sitemap line and the social card all follow from this list. */
export interface Post extends PostMeta {
	slug: string;
	/** The compiled markdown, rendered by the post route. */
	render: Component;
}

interface PostModule {
	default: Component;
	/** YAML turns an unquoted `2026-08-17` into a Date, so a post may spell its
	 * date either way and both have to be understood. */
	metadata?: Partial<Omit<PostMeta, 'date'>> & { date?: string | Date };
}

/** Whatever the frontmatter gave us, as YYYY-MM-DD. */
function asIsoDate(value: string | Date): string {
	return value instanceof Date ? value.toISOString().slice(0, 10) : value.trim().slice(0, 10);
}

// Vite rewrites this call at build time. The OG script runs on Bun, outside
// Vite, where import.meta.glob does not exist: it only needs the page list that
// site.ts derives from posts, and it reads post frontmatter off disk itself, so
// an empty list there is correct rather than a silent failure.
let modules: Record<string, PostModule> = {};
try {
	// Must stay a literal call: Vite rewrites it by static analysis, so it
	// cannot be hoisted into a variable or guarded by a condition.
	modules = import.meta.glob<PostModule>('/src/lib/data/blog/*.md', { eager: true });
} catch {
	// Not running under Vite. Only the OG script gets here, and it reads post
	// frontmatter off disk itself, so an empty list is the right answer.
}

function read(path: string, module: PostModule): Post {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	const meta = module.metadata ?? {};
	// Fail at build rather than rendering a post with a blank heading or
	// sorting it to some arbitrary place in the list.
	for (const field of ['title', 'date', 'summary'] as const) {
		if (!meta[field]) throw new Error(`blog/${slug}.md is missing "${field}" in its frontmatter`);
	}
	const date = asIsoDate(meta.date!);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error(`blog/${slug}.md has date "${String(meta.date)}", expected YYYY-MM-DD`);
	}
	return {
		slug,
		title: meta.title!,
		date,
		summary: meta.summary!,
		hidden: meta.hidden,
		render: module.default
	};
}

/** Newest first. Dates are ISO, so they sort as strings. */
export const posts: Post[] = Object.entries(modules)
	.map(([path, module]) => read(path, module))
	.sort((a, b) => b.date.localeCompare(a.date));

export function postBySlug(slug: string): Post | undefined {
	return posts.find((post) => post.slug === slug);
}

/** `14 Jul 2026`, the way the rest of the site writes a date. */
export function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
