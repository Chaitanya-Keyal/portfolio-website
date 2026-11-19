import { describe, expect, it } from 'vitest';
import { pageAt } from '$lib/content';
import { education } from './education';
import { experience } from './experience';
import { data, linkedPaths } from './profile-json';

/** Hiding an entry takes its page away unless something links to it, so every link the site
 * prints to one of its own pages has to land: the build would stop on the 404, but only after
 * the push. */
describe('links between pages', () => {
  it('lead somewhere from the education page', () => {
    for (const { link } of education.campus) {
      if (link) expect(pageAt(link), link).toBeDefined();
    }
  });

  it('lead somewhere from every "see also"', () => {
    for (const { related } of experience) {
      for (const { href } of related) expect(pageAt(href), href).toBeDefined();
    }
  });

  it('give a hidden entry a page only while something links to it', () => {
    // Read from the library itself: the lists the site uses have already dropped what has no page.
    const hidden = [
      ...[...data.work, ...data.volunteer]
        .filter((e) => e.x?.hidden)
        .map((e) => `/work/${e.x?.slug ?? e.id}`),
      ...data.projects.filter((p) => p.x?.hidden).map((p) => `/projects/${p.x?.slug ?? p.id}`)
    ];
    for (const path of hidden) {
      expect(pageAt(path) !== undefined, path).toBe(linkedPaths.has(path));
    }
  });
});
