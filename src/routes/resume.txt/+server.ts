import { resumeText } from '$lib/text/resume';

export const prerender = true;

export function GET(): Response {
	return new Response(resumeText(), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
