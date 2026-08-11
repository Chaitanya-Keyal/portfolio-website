import { describe, expect, it } from 'vitest';
import { complete, commands, pages, resolvePath, run } from './registry';

/** The shell's filesystem is the route table, so these walk real paths. */
describe('resolvePath', () => {
	it('resolves relative names against the working directory', () => {
		expect(resolvePath('/', 'work')).toBe('/work');
		expect(resolvePath('/work', 'crux')).toBe('/work/crux');
	});

	it('treats a leading slash or tilde as absolute', () => {
		expect(resolvePath('/work/crux', '/projects')).toBe('/projects');
		expect(resolvePath('/work/crux', '~/projects')).toBe('/projects');
		expect(resolvePath('/work/crux', '~')).toBe('/');
	});

	it('walks up, and stops at the root rather than above it', () => {
		expect(resolvePath('/work/crux', '..')).toBe('/work');
		expect(resolvePath('/work/crux', '../..')).toBe('/');
		expect(resolvePath('/work/crux', '../../../..')).toBe('/');
	});

	it('ignores "." and empty segments from stray slashes', () => {
		expect(resolvePath('/work', '.')).toBe('/work');
		expect(resolvePath('/', 'work//crux/')).toBe('/work/crux');
		expect(resolvePath('/work', './crux')).toBe('/work/crux');
	});
});

describe('cd', () => {
	it('navigates to a directory', () => {
		expect(run('cd work', '/')).toEqual({ kind: 'nav', to: '/work' });
	});

	it('goes home with no argument, ~ or /', () => {
		for (const input of ['cd', 'cd ~', 'cd /']) {
			expect(run(input, '/work')).toEqual({ kind: 'nav', to: '/' });
		}
	});

	it('refuses files and unknown paths', () => {
		expect(run('cd resume.txt', '/').kind).toBe('error');
		expect(run('cd nowhere', '/').kind).toBe('error');
	});

	it('goes back to OLDPWD on `cd -`', () => {
		expect(run('cd -', '/projects', '/work/crux')).toEqual({ kind: 'nav', to: '/work/crux' });
		expect(run('cd -', '/work', '/')).toEqual({ kind: 'nav', to: '/' });
	});

	it('has no OLDPWD before anything has moved', () => {
		expect(run('cd -', '/').kind).toBe('error');
		expect(run('cd -', '/work', '/work').kind).toBe('error');
	});
});

describe('ls', () => {
	it('lists children, marking directories', () => {
		const out = run('ls', '/');
		expect(out.kind).toBe('print');
		expect(out.kind === 'print' && out.lines[0]).toContain('work/');
		expect(out.kind === 'print' && out.lines[0]).toContain('resume.txt');
	});

	it('points at `man` only where there is a page behind it', () => {
		const leaf = run('ls', '/work/crux');
		expect(leaf.kind === 'print' && leaf.lines[0]).toBe('(nothing here — try `man`)');
		const bare = run('ls', '/education');
		expect(bare.kind === 'print' && bare.lines[0]).toBe('(nothing here)');
	});

	it('errors on a path that does not exist', () => {
		expect(run('ls nowhere', '/').kind).toBe('error');
	});
});

describe('man', () => {
	it('reads the page you are standing in when given no argument', () => {
		const out = run('man', '/work/crux');
		expect(out.kind).toBe('print');
		expect(out.kind === 'print' && out.lines.join('\n')).toContain('CRUX');
	});

	it('names the pages in a section instead of refusing', () => {
		const out = run('man work', '/');
		expect(out.kind).toBe('print');
		expect(out.kind === 'print' && out.lines[0]).toContain('is a section');
		expect(out.kind === 'print' && out.lines[0]).toContain('crux');
	});

	it('takes a slug, a path, or a .1 suffix', () => {
		const slug = run('man crux', '/');
		const path = run('man work/crux', '/');
		const suffixed = run('man crux.1', '/');
		expect(slug).toEqual(path);
		expect(slug).toEqual(suffixed);
	});

	it('has no entry for something that is not a page', () => {
		expect(run('man nonsense', '/').kind).toBe('error');
	});

	// `ls` on an empty page tells people to try `man`; that has to work.
	it('answers everywhere `ls` sends people', () => {
		for (const page of pages) {
			if (page.file) continue;
			const empty = run('ls', page.path);
			const suggests = empty.kind === 'print' && empty.lines[0].includes('`man`');
			if (suggests) expect(run('man', page.path).kind).toBe('print');
		}
	});
});

describe('cat', () => {
	it('reads a file', () => {
		expect(run('cat resume.txt', '/')).toEqual({ kind: 'cat', url: '/resume.txt' });
	});

	it('refuses a directory and reports a missing path', () => {
		expect(run('cat work', '/').kind).toBe('error');
		expect(run('cat nope.txt', '/').kind).toBe('error');
	});
});

describe('theme', () => {
	it('switches to a known theme', () => {
		expect(run('theme gruvbox', '/')).toEqual({ kind: 'theme', theme: 'gruvbox' });
	});

	it('lists the options when given none, and rejects an unknown one', () => {
		expect(run('theme', '/').kind).toBe('print');
		expect(run('theme neon', '/').kind).toBe('error');
	});
});

describe('the command table', () => {
	it('resolves aliases to their commands', () => {
		expect(run('fetch', '/work')).toEqual(run('neofetch', '/work'));
		expect(run('la', '/')).toEqual(run('ls', '/'));
		expect(run('open work', '/')).toEqual(run('cd work', '/'));
	});

	it('clears the scrollback on the way home, so neofetch looks like it ran', () => {
		for (const name of ['neofetch', 'fetch', 'fastfetch', 'screenfetch']) {
			expect(run(name, '/projects')).toEqual({ kind: 'nav', to: '/', clear: true });
		}
	});

	it('reports an unknown command the way a shell does', () => {
		const out = run('sudoku', '/');
		expect(out.kind).toBe('error');
		expect(out.kind === 'error' && out.lines[0]).toContain('command not found');
	});

	it('does nothing with empty input', () => {
		expect(run('   ', '/')).toEqual({ kind: 'none' });
	});

	it('still runs the commands kept off the help list', () => {
		expect(run('pwd', '/work')).toEqual({ kind: 'print', lines: ['~/work'] });
		expect(run('echo hello there', '/')).toEqual({ kind: 'print', lines: ['hello there'] });
	});

	it('lists only the commands meant to be listed in help', () => {
		const out = run('help', '/');
		const text = out.kind === 'print' ? out.lines.join('\n') : '';
		const listed = commands.filter((c) => !c.hidden && !c.unlisted);
		const withheld = commands.filter((c) => c.hidden || c.unlisted);
		for (const c of listed) expect(text).toContain(c.usage);
		for (const c of withheld) expect(text).not.toContain(`  ${c.usage.padEnd(14)}`);
		expect(listed.length).toBeGreaterThan(0);
		expect(withheld.length).toBeGreaterThan(0);
	});

	it('keeps the easter eggs runnable', () => {
		expect(run('sudo rm', '/').kind).toBe('print');
		expect(run(':q', '/').kind).toBe('print');
	});

	it('gives every listed command a usage and a description', () => {
		for (const c of commands.filter((x) => !x.hidden && !x.unlisted)) {
			expect(c.usage.startsWith(c.name)).toBe(true);
			expect(c.description).not.toBe('');
		}
	});
});

describe('tab completion', () => {
	it('completes a unique command and leaves a space to type the argument', () => {
		expect(complete('who', '/').value).toBe('whoami ');
	});

	it('leaves input alone when nothing matches', () => {
		expect(complete('zzz', '/')).toEqual({ value: 'zzz', options: [] });
	});

	it('offers the options when a prefix is ambiguous', () => {
		const out = complete('c', '/');
		expect(out.options.length).toBeGreaterThan(1);
		expect(out.options).toContain('cd');
		expect(out.options).toContain('cat');
	});

	// A trailing slash on a directory, the way bash does it, so the next
	// keystroke carries straight on into the path.
	it('completes paths after a command that takes one', () => {
		expect(complete('cd wo', '/').value).toBe('cd work/');
		expect(complete('cd ', '/work').options).toContain('crux/');
	});

	it('completes through aliases', () => {
		expect(complete('open wo', '/').value).toBe('open work/');
	});

	it('offers commands kept off help, but never the easter eggs', () => {
		expect(complete('neof', '/').value).toBe('neofetch ');
		expect(complete('sud', '/').options).toEqual([]);
		expect(complete('sud', '/').value).toBe('sud');
	});
});
