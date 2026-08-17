import type { Project } from '$lib/types';

export const projects: Project[] = [
	{
		slug: 'seedsigner',
		name: 'SeedSigner',
		oneLiner: 'air-gapped Bitcoin signing device',
		context: 'Summer of Bitcoin 2025 & 2026',
		period: 'April 2025 to present',
		stack: ['Python', 'Bitcoin', 'GitHub Actions', 'Raspberry Pi'],
		description:
			'SeedSigner is a DIY, air-gapped, stateless Bitcoin signing device built with off-the-shelf parts. I have contributed across two Summer of Bitcoin terms, and stayed on after both, working on features, bugfixes, release chores, PR review and translations.',
		highlights: [
			'Automating the localization workflow across the code and translation repos, so a change to the source strings no longer means routine work for translators, contributors and maintainers.',
			'Built CI tooling that detects missing and stale translations across the 21 supported languages, catching errors before review rather than after it.',
			'Added a per-PR screenshot review page, so a translation can be judged in the screen it actually lands in.',
			'Extended BIP-85 support to enable direct child seed loading on-device.',
			'Refactored the Python codebase for maintainability and shipped UI alerts warning users of abnormally high transaction fees.',
			'Hardened the CI/CD pipelines and fixed targeted bugs, improving build reliability across releases.'
		],
		links: [
			{ label: 'project', href: 'https://github.com/SeedSigner/seedsigner' },
			{
				label: 'my contributions',
				href: 'https://github.com/SeedSigner/seedsigner/issues?q=involves%3AChaitanya-Keyal+sort%3Aupdated-desc'
			},
			{
				label: 'translations repo',
				href: 'https://github.com/SeedSigner/seedsigner-translations/issues?q=involves%3AChaitanya-Keyal+sort%3Aupdated-desc'
			}
		]
	},
	{
		slug: 'satbook',
		name: 'satbook',
		oneLiner: 'self-hosted Bitcoin passbook and India VDA tax engine',
		context: 'Personal project',
		period: 'Aug 2026',
		stack: ['TypeScript', 'SvelteKit', 'Bun', 'SQLite', 'Drizzle'],
		description:
			'A single-user Bitcoin portfolio tracker that doubles as an India VDA tax engine. Every income, buy, sell, spend and self-transfer goes into one ledger, and holdings, break-even, unrealized P/L and Schedule VDA figures are recomputed from it on every read, so correcting or backfilling history just works.',
		highlights: [
			'Computes tax the conservative way under s.115BBH: flat 30% plus cess, cost of acquisition only, losses ring-fenced, network fees neither taxed nor deducted.',
			'Derives the third value from any two of amount, rate and fiat value, and autofills the timestamp, amounts and fee from a pasted on-chain txid.',
			'Fetches the historical rate for backdated entries itself, converting through USD or EUR when that is the only quote available.'
		],
		links: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/satbook' }]
	},
	{
		slug: 'onlinecal',
		name: 'onlineCAL',
		oneLiner: 'live instrument-booking portal for campus researchers',
		context: 'Central Analytical Laboratory, BITS Hyderabad',
		period: 'Aug 2024 to present',
		stack: ['Python', 'Django', 'MySQL', 'DevOps'],
		description:
			'The production portal researchers use to book time on lab instruments. Requests flow through faculty and lab-assistant approval chains with per-instrument pricing. I maintain it as the undergraduate TA.',
		highlights: [
			'Maintain a real system with real users: approval workflows, pricing rules, email notifications.',
			'Set up automated CI/CD so deploys stopped being manual events.'
		],
		links: [{ label: 'source', href: 'https://github.com/CAL-BPHC/onlineCAL' }]
	},
	{
		slug: 'asynchrony',
		name: 'asynchrony',
		oneLiner: 'autonomous NL-to-SQL agent, 1st place at the Synchrony hackathon',
		context: 'Hackathon winner, INR 2,00,000',
		period: 'September 2024',
		stack: ['Python', 'LangChain', 'SQL'],
		description: 'An autonomous agent that translates natural-language questions into complex SQL.',
		highlights: [
			'Engineered dynamic schema parsing so the agent adapts to changing database structures.',
			'Accurately classifies user requests and generates syntax-valid SQL queries for precise personal financial data retrieval.'
		],
		links: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/asynchrony' }]
	},
	{
		slug: 'bitsgpt',
		name: 'BitsGPT',
		oneLiner: 'multi-agent RAG chatbot for campus queries',
		context: 'cruX, BITS Hyderabad programming club',
		period: '2024',
		stack: ['Python', 'LangGraph', 'Vector DBs'],
		description:
			'A campus assistant answering academic, course, and placement questions for BITS students. A classifier node routes each query to specialized agents that share tools and memory.',
		highlights: [
			'Architected the LangGraph graph: classifier -> specialized agents -> shared tools -> conversation memory.',
			'Grounded answers in campus documents through retrieval, with context-aware follow-ups.'
		],
		links: [{ label: 'source', href: 'https://github.com/crux-bphc/bitsgpt-rewrite' }]
	},
	{
		slug: 'chrono-search',
		name: 'Chronofactorem search',
		oneLiner: 'Elasticsearch-powered search service for BITS timetables',
		context: 'cruX, BITS Hyderabad programming club',
		period: '2024',
		stack: ['Python', 'Elasticsearch', 'Docker'],
		description:
			'The search service behind Chronofactorem, the timetable platform BITS students build their semesters on.',
		highlights: [
			'Indexes the entire university course catalog and student timetables for sub-second retrieval.',
			'Designed the Elasticsearch indexing and query layer enabling relevant search results for complex queries.'
		],
		links: [
			{ label: 'source', href: 'https://github.com/crux-bphc/search-service' },
			{ label: 'platform', href: 'https://github.com/crux-bphc/chronofactorem-rewrite' }
		]
	},
	{
		slug: 'biohue',
		name: 'BioHue',
		oneLiner: 'colorimetric readout app for a wound-dressing study',
		context: 'Research group at BITS Hyderabad',
		period: '2025 to 2026',
		stack: ['Python', 'FastAPI', 'OpenCV', 'Next.js', 'MongoDB'],
		description:
			'The readout app for a colorimetric wound-dressing study, built for the research group running it. Photograph a dressing, and the app extracts the sample region, measures its colour and classifies it against the thresholds calibrated for that substrate, so the reading does not depend on who is looking at it.',
		highlights: [
			'Isolates the region of interest by thresholding saturation in HSV, refining the mask with morphological opening and closing, then taking the largest contour.',
			'Detects glare by brightness and repaints it from the average of the surrounding unaffected pixels, so a reflection cannot skew the reading.',
			'Crops that region to a circle, so every sample is measured over the same shape however the photo was framed.',
			'Applies a per-substrate formula to the separated RGB channels and classifies the result against calibrated thresholds.'
		],
		links: [
			{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/BioHue' },
			{
				label: 'the study this supported',
				href: 'https://pubs.acs.org/aidcbc/article/11/8/2218/3662873/Smart-Wound-Dressing-with-Real-Time-Colorimetric'
			}
		]
	},
	{
		slug: 'chrono2gcal',
		name: 'Chrono2GCal',
		oneLiner: 'syncs BITS timetables into Google Calendar',
		context: 'Personal project, used by BITS students',
		period: '2023 to present',
		stack: ['Python', 'Google Calendar API'],
		description:
			'Takes a Chronofactorem timetable ID and writes the whole semester into Google Calendar: classes with their rooms and instructors, exams with the seat allotted to that student, and nothing at all on holidays.',
		highlights: [
			'Pulls the timetable from Chronofactorem directly, so a student supplies only the four-character ID.',
			'Parses the seating-arrangement PDFs the timetable division publishes to find each student allotted exam room.',
			'Clears classes on holidays and exam days, rather than leaving a calendar that quietly disagrees with the semester.',
			'Reads colours, reminders, titles and descriptions from a JSON file, and bulk-deletes by filter when a semester changes.'
		],
		links: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/Chrono2GCal' }]
	},
	{
		slug: 'arcade',
		name: 'Arcade',
		oneLiner: 'multiplayer Monopoly and Chess',
		context: 'Personal project',
		period: '2022 to 2023',
		stack: ['Python', 'Tkinter', 'Flask', 'MySQL'],
		description:
			'Two board games played online against other people. Room and game events travel over a TCP protocol built for it, a Flask API handles accounts, and the client is Tkinter.',
		highlights: [
			'Designed the wire protocol carrying room and game events between the server and every connected player.',
			'Implemented full Monopoly and Chess rules, and the shared state each client has to be kept in step with.',
			'Built accounts, profile pictures and lifetime statistics behind a Flask API backed by MySQL.',
			'Implemented a custom dark theme for Tkinter, and designed the entire UI with custom widgets.'
		],
		links: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/Arcade' }]
	}
];
