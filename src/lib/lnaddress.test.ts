import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lnaddress } from './data/lnaddress';

/** The address on the page is only worth showing if it resolves. Wallets fetch
 * .well-known/lnurlp/<name> and Nostr clients .well-known/nostr.json, so the address has to name
 * files the site ships, and the pay file has to agree with it about the domain as well. */
describe('the Lightning address', () => {
  const [name, domain] = lnaddress.split('@');

  it('is a name and a domain', () => {
    // LUD-16 allows only these characters in the name.
    expect(name).toMatch(/^[a-z0-9._-]+$/);
    expect(domain).toBeTruthy();
  });

  it('names a pay file the site serves, which identifies itself by the same address', () => {
    const file = `static/.well-known/lnurlp/${name}`;
    expect(existsSync(file)).toBe(true);
    // The sync job refuses any response that stops naming the address, so this is what wallets see.
    const metadata: [string, string][] = JSON.parse(
      JSON.parse(readFileSync(file, 'utf8')).metadata
    );
    expect(metadata).toContainEqual(['text/identifier', lnaddress]);
  });

  it('is a Nostr name the site serves', () => {
    const nostr = JSON.parse(readFileSync('static/.well-known/nostr.json', 'utf8'));
    expect(nostr.names[name]).toMatch(/^[0-9a-f]{64}$/);
  });
});
