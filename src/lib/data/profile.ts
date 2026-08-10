export const profile = {
	name: 'Chaitanya Keyal',
	handle: 'okaybro',
	site: 'https://okaybro.dev',
	tagline: 'backend systems · ai agents · open source',
	summary:
		'AI engineering intern and open-source developer — backend systems, AI agents, and Bitcoin tooling.',
	role: 'AI engineering intern · open-source developer',
	education: {
		school: 'BITS Pilani, Hyderabad',
		degree: 'B.E. Computer Science + M.Sc. Mathematics',
		short: 'CS + Math',
		minor: 'Data Science',
		classOf: 2028,
		coursework: [
			'Data Structures & Algorithms',
			'Database Systems',
			'Data Mining',
			'Partial Differential Equations',
			'Differential Geometry',
			'Functional Analysis'
		]
	},
	// Shown on home and every lane page; keep in sync with the resume.
	status: 'Open to Summer 2027 internships — AI infra · backend · Bitcoin',
	contact: {
		email: 'chaitanyakeyal@gmail.com',
		github: 'https://github.com/Chaitanya-Keyal',
		linkedin: 'https://linkedin.com/in/chaitanya-keyal'
	},
	skills: {
		languages: ['Python', 'TypeScript', 'Go', 'C/C++', 'Java'],
		ai: ['LangChain', 'LangGraph', 'RAG pipelines', 'AI agents'],
		backend: ['Django', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Elasticsearch', 'Redis'],
		infra: ['Docker', 'AWS', 'GCP', 'GitHub Actions', 'Linux', 'Nginx']
	}
} as const;
