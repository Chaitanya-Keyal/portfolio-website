# okaybro.dev

My portfolio, built as a terminal in the browser: bordered panes, a working
shell at the bottom (`cd`, `ls`, `man`, tab completion, a few surprises), and
Tokyo Night phosphor. Every page is server-rendered semantic HTML — the TUI is
progressive enhancement, so it all works with JavaScript off.

It also speaks plain text:

```sh
curl okaybro.dev/resume.txt
curl okaybro.dev/man/seedsigner
```

## Stack

SvelteKit (static adapter) · Svelte 5 · TypeScript · hand-rolled TUI, no
xterm.js · Fira Code

All content lives in `src/lib/data/` — one source feeds the pages, the shell,
the text endpoints, and the man pages.

## Develop

```sh
bun install
bun run fonts   # once: copy Fira Code subsets into static/
bun run dev
```

`bun run build` outputs a fully static site in `build/`.

## License

MIT
