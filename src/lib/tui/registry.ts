import { profile } from '$lib/data/profile';
import { projects } from '$lib/data/projects';
import { experience } from '$lib/data/experience';
import { allDocs, docBySlug, docPath, manLines } from '$lib/components/mandoc';
import { themes, isTheme, currentTheme, type Theme } from './theme';

export interface Page {
	name: string;
	path: string;
	/** Label in the rail; only top-level sections have one. */
	rail?: string;
	/** Compact label for the phone tab bar. */
	short?: string;
	/** A plain file, not a page: `cat`-able, not `cd`-able. */
	file?: boolean;
}

/** Every navigable page — the one list behind the rail, the shell's filesystem,
 * the sitemap, and the 404 suggestions. */
export const pages: Page[] = [
	{ name: 'home', path: '/', rail: '~', short: '~' },
	{ name: 'work', path: '/work', rail: 'work/', short: 'work' },
	...experience.map((e) => ({ name: e.slug, path: `/work/${e.slug}` })),
	{ name: 'projects', path: '/projects', rail: 'projects/', short: 'proj' },
	...projects.map((p) => ({ name: p.slug, path: `/projects/${p.slug}` })),
	{ name: 'education', path: '/education', rail: 'education', short: 'edu' },
	{ name: 'resume', path: '/resume', rail: 'resume', short: 'cv' },
	{ name: 'resume.txt', path: '/resume.txt', file: true }
];

/* ---------- the filesystem: routes as paths ---------- */

function pageAt(route: string): Page | undefined {
	return pages.find((p) => p.path === route);
}

function childrenOf(route: string): Page[] {
	const prefix = route === '/' ? '/' : `${route}/`;
	return pages.filter(
		(p) => p.path !== '/' && p.path.startsWith(prefix) && !p.path.slice(prefix.length).includes('/')
	);
}

/** Resolve a shell path argument against the working directory into a route. */
export function resolvePath(cwd: string, arg: string): string {
	const absolute = arg.startsWith('/') || arg.startsWith('~');
	const start = absolute ? [] : cwd.split('/').filter(Boolean);
	const rest = arg.replace(/^~\/?/, '').replace(/^\//, '');
	for (const segment of rest.split('/').filter(Boolean)) {
		if (segment === '.') continue;
		if (segment === '..') start.pop();
		else start.push(segment);
	}
	return '/' + start.join('/');
}

function displayPath(route: string): string {
	return route === '/' ? '~' : `~${route}`;
}

/** The manual page for a route, if it has one. */
function docAt(route: string) {
	return docBySlug(route.split('/').pop() ?? '');
}

/* ---------- outcomes ---------- */

/** What running a command means; navigation and settings are applied by the
 * layout, printing by the shell. */
export type Outcome =
	/** `clear` wipes the scrollback on the way, for commands whose output is
	 * the page itself and which should look like they redrew the screen. */
	| { kind: 'nav'; to: string; clear?: boolean }
	| { kind: 'theme'; theme: Theme }
	| { kind: 'crt' }
	| { kind: 'print'; lines: string[] }
	| { kind: 'error'; lines: string[] }
	| { kind: 'cat'; url: string }
	| { kind: 'animate'; frames: string[][]; interval: number }
	| { kind: 'clear' }
	| { kind: 'none' };

interface CommandSpec {
	name: string;
	usage: string;
	description: string;
	/** Easter eggs: runnable, but absent from help and completion. */
	hidden?: boolean;
	/** Real commands kept off the help list to keep it short. Still complete. */
	unlisted?: boolean;
	run: (args: string[], cwd: string, previous: string) => Outcome;
}

/* ---------- command implementations ---------- */

const treeLines = (): string[] => {
	const lines = ['.'];
	const tops = childrenOf('/');
	tops.forEach((top, ti) => {
		const lastTop = ti === tops.length - 1;
		const kids = childrenOf(top.path);
		lines.push(`${lastTop ? '└──' : '├──'} ${top.name}${!top.file && kids.length ? '/' : ''}`);
		kids.forEach((kid, ki) => {
			const branch = ki === kids.length - 1 ? '└──' : '├──';
			lines.push(`${lastTop ? '    ' : '│   '}${branch} ${kid.name}`);
		});
	});
	return lines;
};

function ls(args: string[], cwd: string): Outcome {
	const target = args.filter((a) => !a.startsWith('-'))[0];
	const route = target ? resolvePath(cwd, target) : cwd;
	const page = pageAt(route);
	if (!page && route !== '/') return { kind: 'error', lines: [`ls: no such file or directory: ${target}`] };
	if (page?.file) return { kind: 'print', lines: [page.name] };
	const entries = childrenOf(route);
	if (entries.length === 0) {
		// Only point at `man` when there is actually a page behind it.
		const hint = docAt(route) ? ' — try `man`' : '';
		return { kind: 'print', lines: [`(nothing here${hint})`] };
	}
	return { kind: 'print', lines: [entries.map((e) => (e.file ? e.name : `${e.name}/`)).join('  ')] };
}

function cd(args: string[], cwd: string, previous: string): Outcome {
	const target = args[0];
	// bash's OLDPWD: back to wherever you were last, however you got here.
	if (target === '-') {
		if (!previous || previous === cwd) return { kind: 'error', lines: ['cd: OLDPWD not set'] };
		return { kind: 'nav', to: previous };
	}
	if (!target || target === '~' || target === '/') return { kind: 'nav', to: '/' };
	const route = resolvePath(cwd, target);
	if (route === '/') return { kind: 'nav', to: '/' };
	const page = pageAt(route);
	if (!page) return { kind: 'error', lines: [`cd: no such file or directory: ${target}`] };
	if (page.file) return { kind: 'error', lines: [`cd: not a directory: ${target}`] };
	return { kind: 'nav', to: page.path };
}

/** Prints the page into the terminal, the way man(1) actually behaves;
 * `cd` is the one that navigates. */
function man(args: string[], cwd: string): Outcome {
	const target = args[0]?.replace(/\.1$/, '');
	// Bare `man` reads the page you are standing in, which is where `ls` sends
	// people when a page has nothing under it.
	const route = target ? resolvePath(cwd, target) : cwd;
	const doc = docAt(route);
	if (doc) {
		return {
			kind: 'print',
			lines: [...manLines(doc), '', `(full page: cd ${docPath(doc)})`]
		};
	}
	// A section is a directory of pages, so name the ones it holds.
	const entries = childrenOf(route).filter((p) => !p.file);
	if (entries.length > 0) {
		const names = entries.map((e) => e.name).join(', ');
		return { kind: 'print', lines: [`man: ${displayPath(route)} is a section — pages: ${names}`] };
	}
	if (!target) return { kind: 'error', lines: ['what manual page do you want?'] };
	return { kind: 'error', lines: [`no manual entry for ${target}`] };
}

function cat(args: string[], cwd: string): Outcome {
	const target = args[0];
	if (!target) return { kind: 'error', lines: ['usage: cat <file>'] };
	const route = resolvePath(cwd, target);
	const page = pageAt(route);
	if (!page) return { kind: 'error', lines: [`cat: no such file or directory: ${target}`] };
	if (!page.file) return { kind: 'error', lines: [`cat: ${target}: is a directory (try \`cd\` or \`man\`)`] };
	return { kind: 'cat', url: page.path };
}

function theme(args: string[]): Outcome {
	const target = args[0];
	if (!target) {
		return {
			kind: 'print',
			lines: [`themes: ${themes.join(' · ')}`, `current: ${currentTheme()}`, 'usage: theme <name>']
		};
	}
	if (!isTheme(target)) return { kind: 'error', lines: [`theme: unknown theme: ${target}`] };
	return { kind: 'theme', theme: target };
}

/* ---------- easter eggs ---------- */

const SL_ART = [
	'      ====        ________ ',
	'  _D _|  |_______/        \\__',
	"   |(_)---  |   H\\________/ |",
	'   /     |  |   H  |  |     |',
	'  |      |  |   H  |__--------',
	'  | ________|___H__/__|_____/',
	'  |/ |   |-----------I_____I ',
	'__/ =| o |=-~~\\  /~~\\  /~~\\ ',
	' |/-=|___|=    ||    ||    ||',
	'  \\_/      \\O=====O=====O=O/ '
];

function slFrames(): string[][] {
	const width = Math.max(...SL_ART.map((l) => l.length));
	const art = SL_ART.map((l) => l.padEnd(width));
	const screen = 80;
	const frames: string[][] = [];
	for (let x = screen; x > -width; x -= 5) {
		frames.push(
			art.map((line) => {
				const shifted = ' '.repeat(Math.max(0, x)) + line.slice(Math.max(0, -x));
				return shifted.slice(0, screen).trimEnd() || ' ';
			})
		);
	}
	return frames;
}

function cowsay(text: string): string[] {
	const words = (text || 'moo').split(/\s+/);
	const chunks: string[] = [];
	let current = '';
	for (const word of words) {
		if (current && current.length + word.length + 1 > 40) {
			chunks.push(current);
			current = word;
		} else {
			current = current ? `${current} ${word}` : word;
		}
	}
	chunks.push(current);
	const width = Math.max(...chunks.map((c) => c.length));
	const bubble = [' ' + '_'.repeat(width + 2)];
	if (chunks.length === 1) {
		bubble.push(`< ${chunks[0]} >`);
	} else {
		chunks.forEach((chunk, i) => {
			const [l, r] =
				i === 0 ? ['/', '\\'] : i === chunks.length - 1 ? ['\\', '/'] : ['|', '|'];
			bubble.push(`${l} ${chunk.padEnd(width)} ${r}`);
		});
	}
	bubble.push(' ' + '-'.repeat(width + 2));
	return [
		...bubble,
		'        \\   ^__^',
		'         \\  (oo)\\_______',
		'            (__)\\       )\\/\\',
		'                ||----w |',
		'                ||     ||'
	];
}

export const commands: CommandSpec[] = [
	{ name: 'ls', usage: 'ls [dir]', description: 'list directory', run: ls },
	{ name: 'cd', usage: 'cd [dir|-]', description: 'change directory', run: cd },
	{ name: 'pwd', usage: 'pwd', description: 'print working directory', unlisted: true, run: (_, cwd) => ({ kind: 'print', lines: [displayPath(cwd)] }) },
	{ name: 'man', usage: 'man [page]', description: 'read a manual page', run: man },
	{ name: 'cat', usage: 'cat <file>', description: 'print a file', run: cat },
	{ name: 'tree', usage: 'tree', description: 'site map', run: () => ({ kind: 'print', lines: treeLines() }) },
	{ name: 'whoami', usage: 'whoami', description: 'who is this', run: () => ({ kind: 'print', lines: [`${profile.name.toLowerCase()} — ${profile.tagline}`] }) },
	{
		name: 'neofetch',
		usage: 'neofetch',
		description: 'the identity card (home)',
		unlisted: true,
		// Clears on the way, so the home page reads as what it just printed
		// rather than as the tail of a session that scrolled past.
		run: () => ({ kind: 'nav', to: '/', clear: true })
	},
	{ name: 'contact', usage: 'contact', description: 'where to reach me', run: () => ({ kind: 'print', lines: [`email     ${profile.contact.email}`, `github    ${profile.contact.github}`, `linkedin  ${profile.contact.linkedin}`] }) },
	{ name: 'theme', usage: 'theme [name]', description: 'switch colorscheme', run: (args) => theme(args) },
	{ name: 'crt', usage: 'crt', description: 'toggle scanlines', run: () => ({ kind: 'crt' }) },
	{ name: 'echo', usage: 'echo <text>', description: 'echo', unlisted: true, run: (args) => ({ kind: 'print', lines: [args.join(' ')] }) },
	{ name: 'clear', usage: 'clear', description: 'clear the screen', run: () => ({ kind: 'clear' }) },
	{
		name: 'help',
		usage: 'help',
		description: 'this list',
		unlisted: true,
		run: () => ({
			kind: 'print',
			lines: [
				'some of what works here:',
				...commands
					.filter((c) => !c.hidden && !c.unlisted)
					.map((c) => `  ${c.usage.padEnd(14)}${c.description}`),
				'',
				'keys: : or / to type here · tab complete · esc to leave'
			]
		})
	},
	{
		name: 'sudo',
		usage: 'sudo <command>',
		description: '',
		hidden: true,
		run: (args) =>
			args.length === 0
				? { kind: 'error', lines: ['usage: sudo <command>'] }
				: { kind: 'print', lines: ['okaybro is not in the sudoers file. This incident will be reported.'] }
	},
	{
		name: 'sl',
		usage: 'sl',
		description: '',
		hidden: true,
		run: () => ({ kind: 'animate', frames: slFrames(), interval: 70 })
	},
	{
		name: 'cowsay',
		usage: 'cowsay <text>',
		description: '',
		hidden: true,
		run: (args) => ({ kind: 'print', lines: cowsay(args.join(' ')) })
	},
	{
		name: 'vim',
		usage: 'vim',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: ["vim: you're already in something better."] })
	},
	{
		name: 'nano',
		usage: 'nano',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: ['nano: too easy. this shell has standards.'] })
	},
	{
		name: 'emacs',
		usage: 'emacs',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: ['emacs: a fine operating system. this site ships with a shell instead.'] })
	},
	{
		name: ':q',
		usage: ':q',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: ["this isn't vim. (respect the reflex, though.)"] })
	},
	{
		name: 'rm',
		usage: 'rm <target>',
		description: '',
		hidden: true,
		run: (args) =>
			args.includes('-rf') && args.includes('/')
				? { kind: 'print', lines: ["rm: it's a portfolio, not a footgun."] }
				: { kind: 'error', lines: ['rm: permission denied (nice try)'] }
	}
];

const ALIASES: Record<string, string> = {
	fetch: 'neofetch',
	fastfetch: 'neofetch',
	screenfetch: 'neofetch',
	l: 'ls',
	la: 'ls',
	ll: 'ls',
	dir: 'ls',
	open: 'cd',
	h: 'help',
	'?': 'help',
	':wq': ':q',
	':q!': ':q'
};

/** `previous` is OLDPWD — where the last navigation came from, for `cd -`. */
export function run(input: string, cwd: string, previous = ''): Outcome {
	const trimmed = input.trim();
	if (!trimmed) return { kind: 'none' };
	const [rawName, ...args] = trimmed.split(/\s+/);
	const name = ALIASES[rawName] ?? rawName;
	const command = commands.find((c) => c.name === name);
	if (!command) return { kind: 'error', lines: [`bash: ${rawName}: command not found (try \`help\`)`] };
	return command.run(args, cwd, previous);
}

/* ---------- tab completion, shell-style ---------- */

export interface Completion {
	/** Full input with the last token completed (or extended to the common prefix). */
	value: string;
	/** When ambiguous: candidates to print, like bash's double-tab. */
	options: string[];
}

function candidatesFor(command: string, cwd: string, partial: string): string[] {
	if (command === 'theme') return themes.filter((t) => t.startsWith(partial));
	if (command === 'man') {
		return allDocs.filter((d) => d.slug.startsWith(partial)).map((d) => d.slug);
	}
	if (!['cd', 'ls', 'cat', 'open'].includes(command)) return [];
	// Path completion: split the partial into dirname + basename.
	const slash = partial.lastIndexOf('/');
	const dirPart = slash === -1 ? '' : partial.slice(0, slash + 1);
	const basePart = slash === -1 ? partial : partial.slice(slash + 1);
	const baseRoute = dirPart ? resolvePath(cwd, dirPart) : cwd;
	return childrenOf(baseRoute)
		.filter((p) => p.name.startsWith(basePart))
		.map((p) => dirPart + p.name + (p.file ? '' : '/'));
}

function commonPrefix(options: string[]): string {
	let prefix = options[0];
	for (const option of options.slice(1)) {
		while (!option.startsWith(prefix)) prefix = prefix.slice(0, -1);
	}
	return prefix;
}

export function complete(input: string, cwd: string): Completion {
	const tokens = input.split(/\s+/);
	const partial = tokens[tokens.length - 1];
	const head = tokens.slice(0, -1);
	const candidates =
		head.length === 0
			? commands.filter((c) => !c.hidden && c.name.startsWith(partial)).map((c) => c.name)
			: candidatesFor(ALIASES[head[0]] ?? head[0], cwd, partial);
	if (candidates.length === 0) return { value: input, options: [] };
	if (candidates.length === 1) {
		const completed = candidates[0] + (head.length === 0 ? ' ' : '');
		return { value: [...head, completed].join(' '), options: [] };
	}
	const prefix = commonPrefix(candidates);
	const value = prefix.length > partial.length ? [...head, prefix].join(' ') : input;
	return { value, options: candidates };
}
