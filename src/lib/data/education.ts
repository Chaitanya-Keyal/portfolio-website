/** The education page, and the school lines on the home page and resume. */
export const education = {
	school: 'Birla Institute of Technology and Science Pilani, Hyderabad Campus',
	schoolShort: 'BITS Pilani, Hyderabad Campus',
	degree: 'B.E. Computer Science + M.Sc. Mathematics',
	short: 'CS + Math',
	minor: 'Data Science',
	classOf: 2028,
	coursework: [
		'Data Structures & Algorithms',
		'Database Systems',
		'Object Oriented Programming',
		'Machine Learning',
		'Deep Learning',
		'Blockchain Technology'
	],
	summary: 'dual degree',
	/** Roles on campus. `link` points at the page that covers it in full. */
	campus: [
		{
			text: 'Undergraduate TA at the Central Analytical Laboratory, maintaining',
			link: '/projects/onlinecal',
			linkText: 'onlinecal'
		},
		{
			text: 'Member of cruX, the programming and computing club — see',
			link: '/work/crux',
			linkText: 'crux'
		},
		{
			text: 'Vice Captain of Velocity, the Roller Skating team (AY 2024-25)'
		},
		{
			text: 'Member of the Swimming team'
		}
	]
} as const;
