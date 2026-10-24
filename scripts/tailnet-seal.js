// Encrypts the private tailnet links into static/okaybro-agent/tailnet/sealed.json, the only
// form they're ever committed in. Run with `bun run tailnet:seal`.
//
// The plain list lives outside the repo, in ~/.config/okaybro/tailnet-links.json (or wherever
// TAILNET_LINKS points): a JSON array of { name, label, url }. The password is typed here,
// hidden, and is never written anywhere; only the PBKDF2 salt and the ciphertext are.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { seal } from '../src/lib/tailnet.ts';

const SOURCE = process.env.TAILNET_LINKS ?? `${homedir()}/.config/okaybro/tailnet-links.json`;
const OUT = 'static/okaybro-agent/tailnet/sealed.json';

/** Read a line without echoing it. */
function askHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let typed = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve(typed);
          return;
        }
        if (ch === '\u0003') {
          process.stdout.write('\n');
          process.exit(130);
        }
        if (ch === '\u007f' || ch === '\b') typed = typed.slice(0, -1);
        else typed += ch;
      }
    };
    stdin.on('data', onData);
  });
}

if (!process.stdin.isTTY) {
  console.error('run this in a terminal: it reads the password without showing it');
  process.exit(1);
}

const links = JSON.parse(readFileSync(SOURCE, 'utf8'));
const valid =
  Array.isArray(links) &&
  links.length > 0 &&
  links.every((l) => l && typeof l.name === 'string' && typeof l.url === 'string');
if (!valid) {
  console.error(`${SOURCE}: expected a non-empty array of { name, label, url }`);
  process.exit(1);
}

const password = await askHidden('password: ');
if (password.length < 12) {
  console.error('use at least 12 characters: the ciphertext is public, so guessing is offline');
  process.exit(1);
}
if ((await askHidden('again:    ')) !== password) {
  console.error("they don't match; nothing written");
  process.exit(1);
}

const sealed = await seal(links, password);
writeFileSync(OUT, JSON.stringify(sealed, null, '\t') + '\n');
console.log(`sealed ${links.length} links into ${OUT}`);
