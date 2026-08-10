import { profile } from '$lib/data/profile';
import { pages } from '$lib/tui/registry';

export const prerender = true;

export function GET(): Response {
	const urls = pages
		.map(({ path }) => `	<url><loc>${profile.site}${path === '/' ? '' : path}</loc></url>`)
		.join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
