import type { EducationX } from './core/schema/types';
import { data } from './profile-json';

const e = data.education[0];
if (!e) throw new Error('profile.json: at least one education entry is required');
const x: EducationX = e.x ?? {};

/** The education page, and the school lines on the home page and resume. */
export const education = {
	school: e.institution,
	schoolShort: x.institutionShort ?? e.institution,
	// `x.degree` is the site's shorter wording; the library's `degreeLine`
	// folds the minor in, which the page lists on its own line.
	degree:
		(x.degree as string | undefined) ??
		x.degreeLine ??
		[e.studyType, e.area].filter(Boolean).join(' '),
	short: x.short ?? '',
	minor: x.minor ?? '',
	classOf: Number((e.endDate ?? '').slice(0, 4)) || undefined,
	coursework: [...e.courses],
	summary: x.summary ?? '',
	/** Roles on campus. `link` points at the page that covers it in full. */
	campus: x.campus ?? []
};
