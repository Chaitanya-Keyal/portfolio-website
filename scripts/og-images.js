// Renders one 1200x630 social-preview image per page, styled as a terminal
// window, into static/og/. Run with `bun run og` (bun resolves the TS imports).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

import { profile } from '../src/lib/data/profile.ts';
import { pages } from '../src/lib/data/site.ts';
import { host } from '../src/lib/data/terminal.ts';
import { allDocs } from '../src/lib/text/mandoc.ts';

// Posts reach the app through import.meta.glob, which only exists inside Vite,
// so their frontmatter is read straight off disk here. Drafts get a card too:
// unlisted still means shareable, and a shared link should preview.
const BLOG_DIR = 'src/lib/data/blog';

function readPosts() {
	let files;
	try {
		files = readdirSync(BLOG_DIR).filter((name) => name.endsWith('.md'));
	} catch {
		return []; // no posts yet
	}
	return files.map((name) => {
		const source = readFileSync(`${BLOG_DIR}/${name}`, 'utf8');
		const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!block) throw new Error(`${BLOG_DIR}/${name} has no frontmatter`);
		const field = (key) => {
			const line = block[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
			// Quotes are optional in YAML, so strip them if they are there.
			return line ? line[1].trim().replace(/^["'](.*)["']$/, '$1') : '';
		};
		return { slug: name.replace(/\.md$/, ''), title: field('title'), summary: field('summary') };
	});
}

const COLORS = {
	bezel: '#16161e',
	bg: '#1a1b26',
	border: '#2f3549',
	fg: '#c0caf5',
	muted: '#8b93b8',
	green: '#9ece6a',
	accent: '#7aa2f7',
	red: '#f7768e',
	yellow: '#e0af68'
};

// One card per page that has a command to show, plus one per man page. The
// copy comes from the page list rather than living here, so a card can never
// drift from the page it previews.
const cards = [
	...pages
		.filter((page) => page.command)
		.map((page) => ({
			key: page.path === '/' ? 'home' : page.path.slice(1).replaceAll('/', '-'),
			command: page.command,
			title: page.path === '/' ? profile.name : page.title,
			detail: page.path === '/' ? profile.tagline : page.description
		})),
	...allDocs.map((doc) => {
		const dir = doc.category === 'PROJECTS' ? 'projects' : 'work';
		return {
			key: `${dir}-${doc.slug}`,
			command: `cat ${dir}/${doc.slug}`,
			title: doc.name,
			detail: doc.oneLiner
		};
	}),
	// Title alone. A post title runs to three lines on its own, and a slug long
	// enough to wrap the prompt line above it left nothing for the summary and
	// pushed the footer off the card. The title is the only part worth reading
	// at thumbnail size anyway.
	...readPosts().map((post) => ({
		key: `blog-${post.slug}`,
		title: post.title
	}))
];

const font = (file) => readFileSync(`node_modules/firacode/distr/ttf/${file}`);

const text = (content, style) => ({ type: 'div', props: { style, children: content } });

function card({ command, title, detail }) {
	return {
		type: 'div',
		props: {
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				background: COLORS.bezel,
				padding: '48px',
				fontFamily: 'Fira Code'
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							background: COLORS.bg,
							border: `2px solid ${COLORS.border}`,
							borderRadius: '14px',
							overflow: 'hidden'
						},
						children: [
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										gap: '12px',
										padding: '22px 28px',
										borderBottom: `2px solid ${COLORS.border}`
									},
									children: [COLORS.red, COLORS.yellow, COLORS.green].map((c) => ({
										type: 'div',
										props: {
											style: { width: '18px', height: '18px', borderRadius: '9px', background: c }
										}
									}))
								}
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										flexDirection: 'column',
										padding: '44px 56px',
										gap: '26px',
										flexGrow: 1
									},
									children: [
										command &&
											text(`${host}:~$ ${command}`, { fontSize: '30px', color: COLORS.green }),
										text(title, { fontSize: '64px', fontWeight: 700, color: COLORS.fg }),
										detail &&
											text(detail, { fontSize: '32px', color: COLORS.muted, lineHeight: 1.4 }),
										{ type: 'div', props: { style: { flexGrow: 1 } } },
										text(profile.site.replace(/^https?:\/\//, ''), {
											fontSize: '26px',
											color: COLORS.accent
										})
									].filter(Boolean)
								}
							}
						]
					}
				}
			]
		}
	};
}

mkdirSync('static/og', { recursive: true });

// Drop cards whose page is gone. Without this they pile up locally: a renamed
// project leaves its old card behind, and the folder stops matching the site.
// CI never saw it, since static/og is gitignored and every run starts empty.
const wanted = new Set(cards.map((entry) => `${entry.key}.png`));
for (const name of readdirSync('static/og')) {
	if (name.endsWith('.png') && !wanted.has(name)) {
		unlinkSync(`static/og/${name}`);
		console.log(`removed static/og/${name}`);
	}
}

for (const entry of cards) {
	const svg = await satori(card(entry), {
		width: 1200,
		height: 630,
		fonts: [
			{ name: 'Fira Code', data: font('FiraCode-Regular.ttf'), weight: 400 },
			{ name: 'Fira Code', data: font('FiraCode-Bold.ttf'), weight: 700 }
		]
	});
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
	writeFileSync(`static/og/${entry.key}.png`, png);
	console.log(`static/og/${entry.key}.png`);
}
