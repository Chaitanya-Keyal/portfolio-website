# okaybro.dev

My portfolio, built as a terminal in the browser: bordered panes, a working
shell at the bottom (`cd`, `ls`, `man`, tab completion, a few surprises), and
Tokyo Night phosphor. Every page is server-rendered semantic HTML, the TUI is
progressive enhancement, so it all works with JavaScript off.

It also speaks plain text:

```sh
curl -L okaybro.dev/resume.txt
curl -L okaybro.dev/man/seedsigner
```

## Stack

SvelteKit (static adapter) · Svelte 5 · TypeScript · hand-rolled TUI, no
xterm.js · Fira Code

Every page is built from `src/lib/data/profile.json`, the library written by
the [resume builder](https://github.com/Chaitanya-Keyal/resume-builder) and
committed here; `resume.json` beside it is the composition the resume page,
`resume.txt` and the PDF print. One source feeds the pages, the shell, the
text endpoints and the man pages:

```
src/lib/
  data/       profile.json and resume.json, plus the modules that map them
              onto the pages: profile · education · experience · projects · site · terminal
  data/core/  the resume builder's renderer, vendored (markup, dates, resolve)
  data/blog/  posts, one markdown file each
  types.ts    the shapes the pages consume
  content.ts  lookups over it, by slug, by route, the bare domain
  visibility.ts  what a listing shows, and in what order
  blog.ts     loads data/blog at build time
  text/       plain-text renderers: mandoc, resume
  tui/        the shell: filesystem, commands, completion, theme, components
  components/ Meta, ManPage, PixelPortrait (generated)
```

Adding a project or a role to the library adds its page, its rail link, its
man page and its sitemap entry with it. No copy is hardcoded in a route.

## Writing a post

Drop a markdown file in `src/lib/data/blog/`. Its filename is its URL.

```markdown
---
title: 'What I built and why'
date: 2026-08-17
summary: One line, used in the index, the tab and the social card.
---

Prose. Headings from `##` down.
```

All three fields are required and the build fails without them. Add
`hidden: true` to keep it a draft: it stays out of the rail, the index, the
sitemap and llms.txt, while its URL still works so it can be read and shared.

That same flag works on a project or a role, and `ls -a` in the shell lists
whatever is hidden.

## Develop

```sh
bun install
bun run fonts   # once: copy Fira Code subsets into static/
bun run dev
```

`bun run resume` builds `static/resume.pdf` from the two JSON files with the
resume builder (cloned into `.resume-builder/`, or `RESUME_BUILDER=path` to a
checkout) and needs `pdflatex`; CI runs it before every deploy.

`bun run build` outputs a fully static site in `build/`. `bun run format` applies
Prettier; `bun run lint` checks it and runs ESLint; `bun run check` type-checks; and
`bun run test` covers the shell's logic, path resolution, the command table, tab
completion and man-page rendering. All three run in CI before a deploy.

Git hooks are installed by `bun install`: commits format and lint the staged
files, pushes run the type-check and the tests. Both are skippable with
`--no-verify` when you need to.

The home page's portrait is a grid of half-block characters generated from
`assets/pfp.png`, `src/lib/components/PixelPortrait.svelte` is written by
`bun run portrait` (needs Pillow and numpy) and should not be edited by hand.

## License

MIT
