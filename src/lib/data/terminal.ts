import { profile } from './profile';

/** Everything the terminal says. Kept here rather than inline in the shell so
 * that the copy is editable in one place and the code stays about behaviour. */

export const banner = String.raw`       _              _
  ___ | | ____ _ _  _| |__  _ _ ___
 / _ \| |/ / _' | || | '_ \| '_/ _ \
 \___/|_|\_\__,_|\_, |_.__/|_| \___/
                 |__/`;

export const bootLines = [
	`${profile.handle}-boot 1.0`,
	'[  OK  ] mount /projects',
	`[  OK  ] load profile: ${profile.name.toLowerCase()}`,
	'[  OK  ] start ui'
];

/** user@host in the prompt, the fetch heading and the window furniture. */
export const host = `${profile.handle}@dev`;

export const messages = {
	empty: '(nothing here)',
	emptyWithPage: '(nothing here, try `man`)',
	manPrompt: 'what manual page do you want?',
	notFound: (name: string) => `bash: ${name}: command not found (try \`help\`)`,
	helpHeader: 'some of what works here:',
	helpKeys: 'keys: : or / to type here · tab complete · esc to leave',
	/** The 404 page, which is a shell error rather than a page. */
	noSuchPath: 'zsh: no such file or directory:',
	didYouMean: 'did you mean:'
};

/** Replies to commands that exist only to be found. */
export const eggs = {
	sudo: `${profile.handle} is not in the sudoers file. This incident will be reported.`,
	vim: "vim: you're already in something better.",
	nano: 'nano: too easy. this shell has standards.',
	emacs: 'emacs: a fine operating system. this site ships with a shell instead.',
	quit: "this isn't vim. (respect the reflex, though.)",
	rmRoot: "rm: it's a portfolio, not a footgun.",
	rmDenied: 'rm: permission denied (nice try)'
};

/** The train that runs when you mistype `ls`. */
export const trainArt = [
	'      ====        ________ ',
	'  _D _|  |_______/        \\__',
	'   |(_)---  |   H\\________/ |',
	'   /     |  |   H  |  |     |',
	'  |      |  |   H  |__--------',
	'  | ________|___H__/__|_____/',
	'  |/ |   |-----------I_____I ',
	'__/ =| o |=-~~\\  /~~\\  /~~\\ ',
	' |/-=|___|=    ||    ||    ||',
	'  \\_/      \\O=====O=====O=O/ '
];
