import { profile } from '$lib/data/profile';
import { eggs, messages, trainArt } from '$lib/data/terminal';
import { docPath, manLines } from '$lib/text/mandoc';
import { urlOf } from '$lib/content';
import {
	childrenOf,
	displayName,
	displayPath,
	docAt,
	isBranch,
	pageAt,
	resolvePath,
	treeLines
} from './filesystem';
import { themes, isTheme, currentTheme, type Theme } from './theme';

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
	/** Not printable: let the browser show it. */
	| { kind: 'open'; url: string }
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

function ls(args: string[], cwd: string): Outcome {
	const flags = args.filter((a) => a.startsWith('-'));
	const all = flags.some((f) => f.includes('a'));
	const long = flags.some((f) => f.includes('l'));
	const target = args.filter((a) => !a.startsWith('-'))[0];
	const route = target ? resolvePath(cwd, target) : cwd;
	const page = pageAt(route);
	if (!page && route !== '/')
		return { kind: 'error', lines: [`ls: no such file or directory: ${target}`] };
	if (page?.file) return { kind: 'print', lines: [displayName(page)] };
	const entries = childrenOf(route, all);
	if (entries.length === 0) {
		// Only point at `man` when there is actually a page behind it.
		const hint = Boolean(docAt(route));
		return { kind: 'print', lines: [hint ? messages.emptyWithPage : messages.empty] };
	}
	const names = entries.map((e) => displayName(e) + (isBranch(e, all) ? '/' : ''));
	if (!long) return { kind: 'print', lines: [names.join('  ')] };
	// The long form has no permissions or sizes to show, so it spends the
	// column on the one thing a listing cannot otherwise tell you: what the
	// entry actually is. That is the man page's NAME line where there is one.
	const width = Math.max(...names.map((n) => n.length)) + 2;
	return {
		kind: 'print',
		lines: entries.map((entry, i) => {
			const about = docAt(entry.path)?.oneLiner ?? entry.description ?? '';
			return (about ? names[i].padEnd(width) + about : names[i]).trimEnd();
		})
	};
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
		return { kind: 'print', lines: [`man: ${displayPath(route)} is a section, pages: ${names}`] };
	}
	if (!target) return { kind: 'error', lines: [messages.manPrompt] };
	return { kind: 'error', lines: [`no manual entry for ${target}`] };
}

/** Files are printed; end pages are opened. Opening rather than printing a page
 * is the one place this parts company with a real shell, and it earns it: `man`
 * already prints them, so printing here would be the same command twice, and
 * the page itself is a far better place to read one than a terminal pane. It
 * also means `cd` and `cat` both get you to a page, whichever you reach for.
 * Anything with pages under it is a directory, and stays uncat-able. */
function cat(args: string[], cwd: string): Outcome {
	const target = args[0];
	if (!target) return { kind: 'error', lines: ['usage: cat <path>'] };
	const route = resolvePath(cwd, target);
	const page = pageAt(route);
	if (!page) return { kind: 'error', lines: [`cat: no such file or directory: ${target}`] };
	if (!page.file) {
		if (childrenOf(route).length > 0) {
			return { kind: 'error', lines: [`cat: ${target}: is a directory`] };
		}
		return { kind: 'nav', to: page.path };
	}
	const url = urlOf(page);
	return page.binary ? { kind: 'open', url } : { kind: 'cat', url };
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

function slFrames(): string[][] {
	const width = Math.max(...trainArt.map((l) => l.length));
	const art = trainArt.map((l) => l.padEnd(width));
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
			const [l, r] = i === 0 ? ['/', '\\'] : i === chunks.length - 1 ? ['\\', '/'] : ['|', '|'];
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
	{ name: 'ls', usage: 'ls [-la] [dir]', description: 'list directory', run: ls },
	{ name: 'cd', usage: 'cd [dir|-]', description: 'change directory', run: cd },
	{
		name: 'pwd',
		usage: 'pwd',
		description: 'print working directory',
		unlisted: true,
		run: (_, cwd) => ({ kind: 'print', lines: [displayPath(cwd)] })
	},
	{ name: 'man', usage: 'man [page]', description: 'read a manual page', run: man },
	{ name: 'cat', usage: 'cat <path>', description: 'open a page, print a file', run: cat },
	{
		name: 'tree',
		usage: 'tree',
		description: 'site map',
		run: (args) => ({
			kind: 'print',
			lines: treeLines(args.some((a) => a.startsWith('-') && a.includes('a')))
		})
	},
	{
		name: 'whoami',
		usage: 'whoami',
		description: 'who is this',
		run: () => ({ kind: 'print', lines: [`${profile.name.toLowerCase()}: ${profile.tagline}`] })
	},
	{
		name: 'neofetch',
		usage: 'neofetch',
		description: 'the identity card (home)',
		unlisted: true,
		// Clears on the way, so the home page reads as what it just printed
		// rather than as the tail of a session that scrolled past.
		run: () => ({ kind: 'nav', to: '/', clear: true })
	},
	{
		name: 'contact',
		usage: 'contact',
		description: 'where to reach me',
		run: () => ({
			kind: 'print',
			lines: [
				`email     ${profile.contact.email}`,
				`github    ${profile.contact.github}`,
				`linkedin  ${profile.contact.linkedin}`
			]
		})
	},
	{
		name: 'theme',
		usage: 'theme [name]',
		description: 'switch colorscheme',
		run: (args) => theme(args)
	},
	{ name: 'crt', usage: 'crt', description: 'toggle scanlines', run: () => ({ kind: 'crt' }) },
	{
		name: 'echo',
		usage: 'echo <text>',
		description: 'echo',
		unlisted: true,
		run: (args) => ({ kind: 'print', lines: [args.join(' ')] })
	},
	{
		name: 'clear',
		usage: 'clear',
		description: 'clear the screen',
		run: () => ({ kind: 'clear' })
	},
	{
		name: 'help',
		usage: 'help',
		description: 'this list',
		unlisted: true,
		run: () => ({
			kind: 'print',
			lines: [
				messages.helpHeader,
				...commands
					.filter((c) => !c.hidden && !c.unlisted)
					.map((c) => `  ${c.usage.padEnd(16)}${c.description}`),
				'',
				messages.helpKeys
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
				: { kind: 'print', lines: [eggs.sudo] }
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
		run: () => ({ kind: 'print', lines: [eggs.vim] })
	},
	{
		name: 'nano',
		usage: 'nano',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: [eggs.nano] })
	},
	{
		name: 'emacs',
		usage: 'emacs',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: [eggs.emacs] })
	},
	{
		name: ':q',
		usage: ':q',
		description: '',
		hidden: true,
		run: () => ({ kind: 'print', lines: [eggs.quit] })
	},
	{
		name: 'rm',
		usage: 'rm <target>',
		description: '',
		hidden: true,
		run: (args) =>
			args.includes('-rf') && args.includes('/')
				? { kind: 'print', lines: [eggs.rmRoot] }
				: { kind: 'error', lines: [eggs.rmDenied] }
	}
];

/** Muscle-memory spellings that map onto a real command. */
/** An expansion is a command line rather than a bare name, so an alias can
 * carry the flags it is named for: `la` really is `ls -a`. */
export const ALIASES: Record<string, string> = {
	fetch: 'neofetch',
	fastfetch: 'neofetch',
	screenfetch: 'neofetch',
	l: 'ls',
	la: 'ls -a',
	ll: 'ls -l',
	lla: 'ls -la',
	dir: 'ls',
	open: 'cd',
	h: 'help',
	'?': 'help',
	':wq': ':q',
	':q!': ':q'
};

/** `previous` is OLDPWD, where the last navigation came from, for `cd -`. */
export function run(input: string, cwd: string, previous = ''): Outcome {
	const trimmed = input.trim();
	if (!trimmed) return { kind: 'none' };
	const [rawName, ...args] = trimmed.split(/\s+/);
	const [name, ...aliasArgs] = (ALIASES[rawName] ?? rawName).split(/\s+/);
	const command = commands.find((c) => c.name === name);
	if (!command) return { kind: 'error', lines: [messages.notFound(rawName)] };
	// The alias's own flags come first, so anything typed can still override.
	return command.run([...aliasArgs, ...args], cwd, previous);
}
