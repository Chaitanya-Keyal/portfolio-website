# okaybro.dev

My portfolio, built as a terminal in the browser: bordered panes, a working
shell at the bottom (`cd`, `ls`, `man`, tab completion, a few surprises), and
Tokyo Night phosphor. Every page is server-rendered semantic HTML — the TUI is
progressive enhancement, so it all works with JavaScript off.

It also speaks plain text:

```sh
curl -L okaybro.dev/resume.txt
curl -L okaybro.dev/man/seedsigner
```

## Stack

SvelteKit (static adapter) · Svelte 5 · TypeScript · hand-rolled TUI, no
xterm.js · Fira Code

Everything editable lives in `src/lib/data/`, and one source feeds the pages,
the shell, the text endpoints and the man pages:

```
src/lib/
  data/       nothing but the information: profile · education · experience · projects · site · terminal
  types.ts    the shapes of everything in data/
  content.ts  lookups over it — by slug, by route, the bare domain
  text/       plain-text renderers: mandoc, resume
  tui/        the shell — filesystem, commands, completion, theme, components
  components/ Meta, ManPage, PixelPortrait (generated)
```

Adding a project or a role adds its page, its rail link, its man page and its
sitemap entry with it. No copy is hardcoded in a route.

## Develop

```sh
bun install
bun run fonts   # once: copy Fira Code subsets into static/
bun run dev
```

`bun run build` outputs a fully static site in `build/`. `bun run format` applies
Prettier; `bun run lint` checks it and runs ESLint; `bun run check` type-checks; and
`bun run test` covers the shell's logic — path resolution, the command table, tab
completion and man-page rendering. All three run in CI before a deploy.

The home page's portrait is a grid of half-block characters generated from
`assets/pfp.png` — `src/lib/components/PixelPortrait.svelte` is written by
`bun run portrait` (needs Pillow and numpy) and should not be edited by hand.

## License

MIT
