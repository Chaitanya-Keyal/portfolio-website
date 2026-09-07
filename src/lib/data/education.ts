import { data } from './profile-json';

const e = data.education[0];
if (!e) throw new Error('profile.json: at least one education entry is required');
const x = (e.x ?? {}) as Record<string, unknown>;

type CampusRole = { text: string; link: string; linkText: string } | { text: string };

/** The education page, and the school lines on the home page and resume. */
export const education = {
	school: (x.school as string | undefined) ?? e.institution,
	schoolShort: (x.institutionShort as string | undefined) ?? e.institution,
	degree:
		(x.degree as string | undefined) ??
		(x.degreeLine as string | undefined) ??
		[e.studyType, e.area].filter(Boolean).join(' '),
	short: (x.short as string | undefined) ?? '',
	minor: (x.minor as string | undefined) ?? '',
	classOf: Number((e.endDate ?? '').slice(0, 4)) || undefined,
	coursework: [...e.courses],
	summary: (x.summary as string | undefined) ?? '',
	/** Roles on campus. `link` points at the page that covers it in full. */
	campus: ((x.campus as CampusRole[] | undefined) ?? []).map((r) =>
		'link' in r && r.link ? { text: r.text, link: r.link, linkText: r.linkText } : { text: r.text }
	) as CampusRole[]
};
