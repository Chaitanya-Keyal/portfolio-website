import type { Experience } from '$lib/types';

export const experience: Experience[] = [
	{
		slug: 'onfinance',
		org: 'OnFinance AI',
		role: 'AI Engineering Intern',
		period: 'Jun 2025 — present',
		oneLiner: 'AI agents for financial compliance',
		description:
			'OnFinance builds an AI compliance platform for financial institutions. I work on the agent side of it: pipelines that read regulation so compliance teams do not have to, and the plumbing that keeps autonomous agents reliable enough for production use.',
		stack: ['Python', 'LangGraph', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Kubernetes'],
		points: [
			'Build LangChain/LangGraph agents that automate regulatory-circular analysis for SEBI, RBI, IRDAI, and AMFI — cutting interpretation time by ~90% and saving 100+ hours per regulatory update.',
			'Designed a search agent over 200+ circulars and 20,000+ clauses that answers with citations instead of raw matches.',
			'Orchestrate end-to-end pipelines spanning document parsing, action-item generation, evidence review, and risk analysis.',
			'Operate what I ship: deployments, migrations, and the incident write-ups that follow.'
		],
		proof: [],
		related: []
	},
	{
		slug: 'summer-of-bitcoin',
		org: 'Summer of Bitcoin — SeedSigner',
		role: 'Open Source Developer',
		period: '2025 & 2026',
		oneLiner: 'two accepted terms on an air-gapped Bitcoin signer',
		description:
			'Summer of Bitcoin places students into open-source Bitcoin projects through a competitive selection. I was accepted twice, both times on SeedSigner — a DIY hardware wallet where a bug is not a bad day, it is somebody’s money.',
		stack: ['Python', 'embedded Linux', 'GitHub Actions'],
		points: [
			'2026: automating the localization workflow — CI that catches missing and stale translations across 21 languages before a maintainer ever sees the PR.',
			'2025: extended BIP-85 so child seeds load directly on-device, shipped high-fee warnings, and hardened the CI/CD pipeline.',
			'~20 commits merged into upstream dev, including commits in the v0.8.7 release.'
		],
		proof: [
			{
				label: 'merged commits',
				href: 'https://github.com/SeedSigner/seedsigner/commits?author=Chaitanya-Keyal'
			}
		],
		related: [{ label: 'seedsigner', href: '/projects/seedsigner' }]
	},
	{
		slug: 'sellersetu',
		org: 'SellerSetu',
		role: 'Software Engineering Intern',
		period: 'Mar 2024 — Mar 2025',
		oneLiner: 'ONDC microservices at 10k+ daily transactions',
		description:
			'SellerSetu runs commerce infrastructure on ONDC, India’s open network for digital commerce. I joined when it was a monolith and left it a set of services that could actually take the load.',
		stack: ['Go', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
		points: [
			'Refactored the ONDC monolith into Go/Django microservices handling 10k+ daily transactions at 2× the previous throughput.',
			'Cut API latency from ~5s to ~1s through architectural changes and resource management.',
			'Built an agentic booking system integrating ONDC, Uber, and Rapido through browser automation.'
		],
		proof: [],
		related: []
	},
	{
		slug: 'crux',
		org: 'cruX — programming club, BITS Hyderabad',
		role: 'Core member',
		period: '2024 — present',
		oneLiner: 'shipping software the campus actually uses',
		description:
			'cruX is the developer society at BITS Hyderabad. The projects are real: they have users, uptime, and semesters of maintenance behind them.',
		stack: ['Python', 'TypeScript', 'LangGraph', 'Elasticsearch', 'Django'],
		points: [
			'Built the multi-agent RAG chatbot BitsGPT and the Elasticsearch search service behind Chronofactorem, the campus timetable platform.',
			'Maintain onlineCAL, the instrument-booking portal for the Central Analytical Laboratory, as its undergraduate TA.',
			'Co-organized cruXipher, the campus-wide capture-the-flag competition.'
		],
		proof: [{ label: 'club github', href: 'https://github.com/crux-bphc' }],
		related: [
			{ label: 'bitsgpt', href: '/projects/bitsgpt' },
			{ label: 'chrono-search', href: '/projects/chrono-search' },
			{ label: 'onlinecal', href: '/projects/onlinecal' }
		]
	}
];
