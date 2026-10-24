import { describe, expect, it } from 'vitest';
import { seal, unseal, type TailnetLink } from './tailnet';
import { complete } from './tui/completion';
import { commands, run } from './tui/commands';

const links: TailnetLink[] = [
  { name: 'hub', label: 'all sessions', url: 'https://hub.example.ts.net/' },
  { name: 'links', label: 'this page', url: '/okaybro-agent/tailnet/' }
];

// A real seal costs 600k PBKDF2 rounds; the tests only need the scheme, not the cost.
const FAST = 1000;

describe('tailnet sealing', () => {
  it('round-trips with the right password', async () => {
    const sealed = await seal(links, 'correct horse battery', FAST);
    expect(await unseal(sealed, 'correct horse battery')).toEqual(links);
  });

  it('refuses the wrong password', async () => {
    const sealed = await seal(links, 'correct horse battery', FAST);
    expect(await unseal(sealed, 'wrong')).toBeNull();
  });

  it('carries no plaintext', async () => {
    const sealed = await seal(links, 'correct horse battery', FAST);
    expect(JSON.stringify(sealed)).not.toContain('example.ts.net');
  });
});

describe('the tailnet command', () => {
  it('stays out of help and completion', () => {
    expect(commands.find((c) => c.name === 'tailnet')?.hidden).toBe(true);
    expect(complete('tail', '/').options).not.toContain('tailnet');
    expect(complete('tail', '/').value).not.toBe('tailnet ');
  });

  it('asks for the password, rejects a wrong one, then lists and opens', async () => {
    const sealed = await seal(links, 'correct horse battery', FAST);
    const load = async () => sealed;

    const first = run('tailnet', '/');
    if (first.kind !== 'askpass') throw new Error(`expected askpass, got ${first.kind}`);
    expect(await first.then('nope', load)).toEqual({
      kind: 'error',
      lines: ['tailnet: wrong password']
    });

    const retry = run('tailnet', '/');
    if (retry.kind !== 'askpass') throw new Error(`expected askpass, got ${retry.kind}`);
    const listed = await retry.then('correct horse battery', load);
    expect(listed.kind).toBe('print');
    if (listed.kind === 'print') expect(listed.lines.join('\n')).toContain('hub');

    // Unlocked for the rest of the tab: no second prompt.
    expect(run('tailnet hub', '/')).toEqual({ kind: 'open', url: 'https://hub.example.ts.net/' });
    expect(run('tailnet nowhere', '/').kind).toBe('error');
  });
});
