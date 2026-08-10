// Renders one 1200x630 social-preview image per page, styled as a terminal
// window, into static/og/. Run with `bun run og` (bun resolves the TS imports).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { profile } from '../src/lib/data/profile.ts';
import { allDocs } from '../src/lib/components/mandoc.ts';

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

const cards = [
	{ key: 'home', command: 'whoami', title: profile.name, detail: profile.tagline },
	{ key: 'work', command: 'ls work/', title: 'work', detail: 'AI engineering · open source · backend systems' },
	{ key: 'projects', command: 'ls projects/', title: 'projects', detail: 'five, each with proof attached' },
	{ key: 'education', command: 'cd education', title: profile.education.school, detail: `${profile.education.short} · class of ${profile.education.classOf}` },
	{ key: 'resume', command: 'cat resume.txt', title: 'resume', detail: profile.status },
	...allDocs.map((doc) => ({
		key: (doc.category === 'PROJECTS' ? 'projects-' : 'work-') + doc.slug,
		command: `man ${doc.slug}`,
		title: doc.name,
		detail: doc.oneLiner
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
										props: { style: { width: '18px', height: '18px', borderRadius: '9px', background: c } }
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
										text(`okaybro@dev:~$ ${command}`, { fontSize: '30px', color: COLORS.green }),
										text(title, { fontSize: '64px', fontWeight: 700, color: COLORS.fg }),
										text(detail, { fontSize: '32px', color: COLORS.muted, lineHeight: 1.4 }),
										{ type: 'div', props: { style: { flexGrow: 1 } } },
										text('okaybro.dev', { fontSize: '26px', color: COLORS.accent })
									]
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
