/** The shapes of everything in data/. Kept out of those files so they stay
 * nothing but the information itself. */

export interface ProofLink {
	label: string;
	href: string;
}

export interface Project {
	slug: string;
	name: string;
	/** man-page NAME line: lowercase, one clause */
	oneLiner: string;
	context: string;
	period: string;
	stack: string[];
	description: string;
	highlights: string[];
	proof: ProofLink[];
}

export interface Experience {
	slug: string;
	org: string;
	role: string;
	period: string;
	/** man-page NAME line: lowercase, one clause */
	oneLiner: string;
	description: string;
	stack: string[];
	points: string[];
	proof: ProofLink[];
	/** related pages on this site */
	related: { label: string; href: string }[];
}

export interface Page {
	name: string;
	path: string;
	/** Label in the rail; only top-level sections have one. */
	rail?: string;
	/** Compact label for the phone tab bar. */
	short?: string;
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
