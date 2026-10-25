// Keeps a static Lightning address file in step with the live LNbits response behind it.
// Run it on a schedule from the repo that publishes the file; see lnaddress-sync.yml.
//
// The file has to be the live response byte for byte: the invoice LNbits hands back commits
// to a hash of `metadata`, and a wallet rejects it if that hash doesn't match the metadata it
// was served. Only a response that still names LNADDRESS_IDENTIFIER and calls back to
// LNADDRESS_CALLBACK_HOST is ever written. Anything else leaves the file alone and fails the
// run, which is the alert.
//
//   LNADDRESS_SOURCE         https://pay.example-tailnet.ts.net/.well-known/lnurlp/alice
//   LNADDRESS_TARGET         .well-known/lnurlp/alice (the published file, in this repo)
//   LNADDRESS_IDENTIFIER     alice@example.com
//   LNADDRESS_CALLBACK_HOST  pay.example-tailnet.ts.net
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};
const SOURCE = env('LNADDRESS_SOURCE');
const TARGET = env('LNADDRESS_TARGET');
const IDENTIFIER = env('LNADDRESS_IDENTIFIER');
const CALLBACK_HOST = env('LNADDRESS_CALLBACK_HOST');

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`${SOURCE} answered ${res.status}`);
const body = await res.text();

// Any of these throwing on a malformed response is also a refusal.
const lnurl = JSON.parse(body);
const callback = new URL(lnurl.callback);
const metadata = JSON.parse(lnurl.metadata);

const problems = [];
if (lnurl.tag !== 'payRequest') problems.push(`tag is ${lnurl.tag ?? lnurl.reason}`);
if (callback.protocol !== 'https:' || callback.hostname !== CALLBACK_HOST) {
  problems.push(`callback moved to ${callback.origin}`);
}
if (!metadata.some(([type, value]) => type === 'text/identifier' && value === IDENTIFIER)) {
  problems.push(`metadata no longer names ${IDENTIFIER}`);
}
if (
  !Number.isInteger(lnurl.minSendable) ||
  !Number.isInteger(lnurl.maxSendable) ||
  lnurl.minSendable > lnurl.maxSendable
) {
  problems.push('sendable range is malformed');
}
if (problems.length) throw new Error(`refusing the response: ${problems.join('; ')}`);

let current = null;
try {
  current = readFileSync(TARGET, 'utf8');
} catch {}
const changed = current !== body;
if (changed) {
  mkdirSync(dirname(TARGET), { recursive: true });
  writeFileSync(TARGET, body);
}
console.log(changed ? `updated ${TARGET}` : `${TARGET} is current`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
