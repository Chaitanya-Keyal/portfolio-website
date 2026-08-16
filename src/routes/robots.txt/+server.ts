import { profile } from '$lib/data/profile';

export const prerender = true;

export function GET(): Response {
	const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${profile.site}/sitemap.xml`, ''].join(
		'\n'
	);
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
