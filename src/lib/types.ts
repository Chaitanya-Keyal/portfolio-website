/** The shapes of everything in data/. Kept out of those files so they stay
 * nothing but the information itself. */

export interface Link {
	label: string;
	href: string;
}

export interface Project {
	slug: string;
	name: string;
	/** Kept out of the rail, the index and the sitemap, like a dotfile. Still
	 * reachable: `ls -a` lists it, the shell resolves it, the URL works. */
	hidden?: boolean;
	/** man-page NAME line: lowercase, one clause */
	oneLiner: string;
	context: string;
	period: string;
	stack: string[];
	description: string;
	/** Inline markup (bold, links); see data/core/markup. */
	highlights: string[];
	links: Link[];
}

export interface Experience {
	slug: string;
	org: string;
	/** Listed nowhere, reachable everywhere. See Project.hidden. */
	hidden?: boolean;
	role: string;
	period: string;
	/** man-page NAME line: lowercase, one clause */
	oneLiner: string;
	description: string;
	stack: string[];
	/** Inline markup (bold, links); see data/core/markup. */
	points: string[];
	links: Link[];
	/** related pages on this site */
	related: { label: string; href: string }[];
}

/** A post's frontmatter, as written at the top of its .md file. */
export interface PostMeta {
	title: string;
	/** ISO date, YYYY-MM-DD. Sorted on, and printed. */
	date: string;
	/** One line, for the index, the tab and the social card. */
	summary: string;
	/** A draft: listed nowhere, but its URL works so it can be read and shared
	 * before it is finished. Same flag the rest of the site uses. */
	hidden?: boolean;
}

export interface Page {
	name: string;
	path: string;
	/** Listed nowhere, reachable everywhere. See Project.hidden. */
	hidden?: boolean;
	/** Label in the rail; only top-level sections have one. */
	rail?: string;
	/** Compact label for the phone tab bar. */
	short?: string;
	/** A rail section that stays shut: the folder is listed, its contents are
	 * not. For a section whose children are titles rather than names, where the
	 * list would be long and would say little. */
	collapsed?: boolean;
	/** A plain file, not a page: `cat`-able, not `cd`-able. */
	file?: boolean;
	/** Where the file actually lives, when that differs from its shell path.
	 * The published URLs predate the shell's layout and are linked from the
	 * README and the man pages, so they stay put. */
	url?: string;
	/** Not text: `cat` hands it to the browser instead of printing it. */
	binary?: boolean;
	/** The command shown in this page's social-preview card. */
	command?: string;
	/** Shown in the tab and to crawlers. The name is appended for you. */
	title?: string;
	description?: string;
}
