import { base } from '$app/paths';
import { profile } from '$lib/data/profile';

export const prerender = true;

/** Generated rather than kept in static/, so the name comes from the profile
 * like everything else does. */
export function GET(): Response {
	const manifest = {
		name: profile.name,
		short_name: profile.handle,
		icons: [{ src: `${base}/favicon.svg`, sizes: 'any', type: 'image/svg+xml' }],
		start_url: `${base}/`,
		display: 'browser',
		background_color: '#1a1b26',
		theme_color: '#1a1b26'
	};
	return new Response(JSON.stringify(manifest, null, '\t'), {
		headers: { 'Content-Type': 'application/manifest+json' }
	});
}
