import raw from '$lib/data/profile.json';

export const prerender = true;

/** The library behind every page, as the resume builder reads it. GitHub Pages
 * answers with `access-control-allow-origin: *`, so "import from URL" works
 * from any origin. */
export function GET(): Response {
	return new Response(JSON.stringify(raw, null, '\t') + '\n', {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
}
