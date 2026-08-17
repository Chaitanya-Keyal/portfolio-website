/** What a listing shows.
 *
 * Hidden entries resolve and render like any other, they are simply never
 * enumerated: the rail, the indexes, the sitemap, llms.txt and the resume all
 * go through here, so hiding something cannot half-apply. `ls -a` and `tree -a`
 * opt back in, the way a shell treats dotfiles.
 *
 * This lives on its own rather than in content.ts because data/site.ts needs it
 * too, and content.ts already reads from site.ts. */
export function listed<T extends { hidden?: boolean }>(items: T[]): T[] {
	return items.filter((item) => !item.hidden);
}

/** The same set, hidden entries last. For the listings that do show them: a
 * dotfile sorting in among the rest reads as an ordinary entry that happens to
 * start with a dot, so they group at the end instead. A stable partition by
 * construction, so each group keeps the order the data gave it. */
export function hiddenLast<T extends { hidden?: boolean }>(items: T[]): T[] {
	return [...listed(items), ...items.filter((item) => item.hidden)];
}
