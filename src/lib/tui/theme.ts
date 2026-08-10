export const themes = ['tokyo-night', 'one-dark', 'gruvbox', 'paper'] as const;
export type Theme = (typeof themes)[number];

export const DEFAULT_THEME: Theme = 'tokyo-night';

export function isTheme(value: string): value is Theme {
	return (themes as readonly string[]).includes(value);
}

export function currentTheme(): Theme {
	if (typeof document === 'undefined') return DEFAULT_THEME;
	const set = document.documentElement.dataset.theme ?? '';
	return isTheme(set) ? set : DEFAULT_THEME;
}

export function setTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// Private browsing: the theme still applies for this page view.
	}
}
