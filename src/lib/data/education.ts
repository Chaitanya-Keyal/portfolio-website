/** The education page, and the school lines on the home page and resume. */
export const education = {
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
	],
	summary: 'dual degree',
	description:
		'A dual-degree program: engineering and mathematics in parallel. The CS half pays the bills; the math half explains why the CS half works.',
	/** Roles on campus. `link` points at the page that covers it in full. */
	campus: [
		{
			text: 'Core member of cruX, the programming club — see',
			link: '/work/crux',
			linkText: 'crux'
		},
		{
			text: 'Undergraduate TA at the Central Analytical Laboratory, maintaining',
			link: '/projects/onlinecal',
			linkText: 'onlinecal'
		}
	]
} as const;
