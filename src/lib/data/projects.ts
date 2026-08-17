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
		context: 'Hackathon winner, ₹2,00,000',
		period: 'September 2024',
		stack: ['Python', 'LangChain', 'SQL'],
		description:
			'An autonomous agent that translates natural-language questions into complex SQL. It took first place at the Synchrony hackathon.',
		highlights: [
			'Engineered dynamic schema parsing so the agent adapts to changing database structures.',
			'Accurately classifies user requests and generates syntax-valid SQL queries for precise personal financial data retrieval.',
			'Handles complaints in real-time, ensuring instant and precise responses.'
		],
		links: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/asynchrony' }]
	},
	{
		slug: 'bitsgpt',
		name: 'BitsGPT',
		oneLiner: 'multi-agent RAG chatbot for campus queries',
		context: 'cruX, BITS Hyderabad programming club',
		period: '2024 to 2025',
		stack: ['Python', 'LangGraph', 'vector DB'],
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
		oneLiner: 'sub-second search over the full course catalog',
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
	}
];
