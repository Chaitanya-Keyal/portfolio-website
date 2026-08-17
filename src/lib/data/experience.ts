import type { Experience } from '$lib/types';

export const experience: Experience[] = [
	{
		slug: 'onfinance',
		org: 'OnFinance AI',
		role: 'AI Engineering Intern',
		period: 'Jun 2025 to present',
		oneLiner: 'AI agents for financial compliance',
		description:
			'OnFinance builds an AI compliance platform for financial institutions. I mainly work on the agent side of it: pipelines that read regulation so compliance teams do not have to, and the plumbing that keeps autonomous agents reliable enough for production use.',
		stack: ['Python', 'LangChain', 'LangGraph', 'FastAPI', 'Kubernetes', 'PostgreSQL', 'MongoDB'],
		points: [
			'Built LangChain/LangGraph agents from scratch that automate circular analysis for various regulators like SEBI, RBI, AMFI, etc., cutting interpretation time by ~90% and saving 100+ hours per regulatory update.',
			'Designed a search agent over 2000+ circulars and 500,000+ clauses that answers with citations instead of raw matches.',
			'Orchestrated end-to-end pipelines spanning document parsing, action-item generation, evidence review, and risk analysis.',
			'Migrated the backend service to PostgreSQL from MongoDB, improving query performance by 2 to 3x.'
		],
		links: [],
		related: []
	},
	{
		slug: 'summer-of-bitcoin',
		org: 'Summer of Bitcoin',
		role: 'Open Source Developer',
		period: 'Summer 2025 and Summer 2026',
		oneLiner: 'open-source Bitcoin development on SeedSigner',
		description:
			'Summer of Bitcoin places students into open-source Bitcoin projects through a competitive selection. About 50 to 60 students are selected globally each year, from roughly 5,000 applicants. I was selected twice, both times to work on SeedSigner, an air-gapped Bitcoin signing device.',
		stack: ['Python', 'Bitcoin', 'GitHub Actions', 'Raspberry Pi'],
		points: [
			'Now one of the top contributors to SeedSigner, involved in 80+ PRs and issues.',
			'Stayed on between and after both terms: features, bugfixes, release chores, PR review and translations.',
			'2026 term: translation automation and the review workflow around it.',
			'2025 term: extended BIP-85 support, so child seeds load directly on-device.'
		],
		links: [
			{
				label: 'my contributions',
				href: 'https://github.com/SeedSigner/seedsigner/issues?q=involves%3AChaitanya-Keyal+sort%3Aupdated-desc'
			}
		],
		related: [{ label: 'seedsigner', href: '/projects/seedsigner' }]
	},
	{
		slug: 'sellersetu',
		org: 'SellerSetu',
		role: 'Software Engineering Intern',
		period: 'Mar 2024 to Mar 2025',
		oneLiner: 'ONDC platform at 10k+ daily transactions',
		description:
			'SellerSetu ran commerce infrastructure on ONDC, India’s open network for digital commerce. I worked on the backend and their agentic booking system.',
		stack: ['Go', 'Django', 'PostgreSQL', 'LangChain', 'LangGraph'],
		points: [
			'Refactored the ONDC monolith into Go/Django microservices handling 10k+ daily transactions at 2x the previous throughput.',
			'Cut API latency from ~5s to ~1s through architectural changes and resource management.',
			'Built an agentic booking system integrating ONDC, Uber, and Rapido through browser automation.'
		],
		links: [],
		related: []
	},
	{
		slug: 'crux',
		org: 'cruX',
		role: 'Member',
		period: 'Jan 2024 to present',
		oneLiner: 'the programming and computing club at BITS Hyderabad',
		description:
			'cruX is the developer society at BITS Hyderabad. We build projects that interest us or help students on campus, and try to improve the programming culture.',
		stack: ['Python', 'LangGraph', 'Elasticsearch'],
		points: [
			'Built BitsGPT, a multi-agent RAG chatbot (LangGraph + vector DB) for academic queries.',
			'Contributed to Chronofactorem, with Elasticsearch-powered search service indexing the full course catalog + timetables for sub-second retrieval.',
			'Built Chrono2GCal, a Python tool auto-syncing semester timetables to Google Calendar.'
		],
		links: [{ label: 'club github', href: 'https://github.com/crux-bphc' }],
		related: [
			{ label: 'bitsgpt', href: '/projects/bitsgpt' },
			{ label: 'chrono-search', href: '/projects/chrono-search' }
		]
	}
];
