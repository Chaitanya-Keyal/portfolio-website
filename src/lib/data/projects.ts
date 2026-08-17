import type { Project } from '$lib/types';

export const projects: Project[] = [
	{
		slug: 'seedsigner',
		name: 'SeedSigner',
		oneLiner: 'air-gapped Bitcoin hardware wallet, core contributor',
		context: 'Summer of Bitcoin 2025 & 2026',
		period: '2025 to present',
		stack: ['Python', 'embedded Linux', 'GitHub Actions'],
		description:
			'SeedSigner turns a Raspberry Pi into an air-gapped Bitcoin signing device. I have contributed across two Summer of Bitcoin terms, with ~20 commits merged into upstream dev, including commits in the v0.8.7 release.',
		highlights: [
			'Built the localization pipeline that ships SeedSigner in 21 languages, with CI that detects missing and stale translations before review.',
			'Extended BIP-85 support to load child seeds directly on-device.',
			'Shipped UI warnings for abnormally high transaction fees.',
			'Hardened CI/CD and refactored core screens for maintainability.'
		],
		proof: [
			{
				label: 'merged commits',
				href: 'https://github.com/SeedSigner/seedsigner/commits?author=Chaitanya-Keyal'
			},
			{ label: 'project', href: 'https://github.com/SeedSigner/seedsigner' }
		]
	},
	{
		slug: 'bitsgpt',
		name: 'BitsGPT',
		oneLiner: 'multi-agent RAG chatbot for campus queries',
		context: 'cruX, BITS Hyderabad programming club',
		period: '2024 to present',
		stack: ['Python', 'LangGraph', 'vector DB'],
		description:
			'A campus assistant answering academic, course, and placement questions for BITS students. A classifier node routes each query to specialized agents that share tools and memory.',
		highlights: [
			'Architected the LangGraph graph: classifier → specialized agents → shared tools → conversation memory.',
			'Grounded answers in campus documents through retrieval, with context-aware follow-ups.'
		],
		proof: [{ label: 'source', href: 'https://github.com/crux-bphc/bitsgpt-rewrite' }]
	},
	{
		slug: 'chrono-search',
		name: 'Chronofactorem search',
		oneLiner: 'sub-second search over the full course catalog',
		context: 'cruX, BITS Hyderabad programming club',
		period: '2024',
		stack: ['TypeScript', 'Elasticsearch', 'Docker'],
		description:
			'The search service behind Chronofactorem, the timetable platform BITS students build their semesters on. Indexes the entire university course catalog and student timetables for sub-second retrieval.',
		highlights: [
			'Designed the Elasticsearch indexing and query layer for catalog and timetable search.',
			'Kept lookups sub-second across the full course catalog during registration load.'
		],
		proof: [
			{ label: 'source', href: 'https://github.com/crux-bphc/search-service' },
			{ label: 'platform', href: 'https://github.com/crux-bphc/chronofactorem-rewrite' }
		]
	},
	{
		slug: 'onlinecal',
		name: 'onlineCAL',
		oneLiner: 'live instrument-booking portal for campus researchers',
		context: 'Central Analytical Laboratory, BITS Hyderabad',
		period: '2024 to present',
		stack: ['Python', 'Django', 'MySQL'],
		description:
			'The production portal researchers use to book time on lab instruments. Requests flow through faculty and lab-assistant approval chains with per-instrument pricing. I maintain it as the undergraduate TA.',
		highlights: [
			'Maintain a real system with real users: approval workflows, pricing rules, email notifications.',
			'Set up automated CI/CD so deploys stopped being manual events.'
		],
		proof: [{ label: 'source', href: 'https://github.com/CAL-BPHC/onlineCAL' }]
	},
	{
		slug: 'finquery',
		name: 'FinQuery AI',
		oneLiner: 'autonomous NL-to-SQL agent, 1st place at the Synchrony hackathon',
		context: 'Hackathon winner, ₹2,00,000',
		period: '2025',
		stack: ['Python', 'LangChain', 'SQL'],
		description:
			'An autonomous agent that translates natural-language questions into complex SQL. Won first place at the Synchrony hackathon.',
		highlights: [
			'Engineered dynamic schema parsing so the agent adapts to changing database structures.',
			'Reached 100% syntax-valid SQL generation on the judged evaluation set.'
		],
		proof: [{ label: 'source', href: 'https://github.com/Chaitanya-Keyal/asynchrony' }]
	}
];
