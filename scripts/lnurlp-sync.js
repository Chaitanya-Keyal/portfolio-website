// Keeps the okaybro@chaitanyakeyal.com Lightning address in step with the Wallet of Satoshi
// account behind it. Run hourly by .github/workflows/lnurlp-sync.yml.
//
// A Lightning address is a static file: a wallet fetches /.well-known/lnurlp/okaybro, then asks
// its `callback` for an invoice. The callback is WoS's own, so the file has to be WoS's response
// byte for byte: the invoice WoS hands back commits to a hash of `metadata`, and a wallet rejects
// it if that hash doesn't match the metadata it was served here.
//
// Only a response that still points at this WoS account is ever written. Anything else leaves
// the published file alone and fails the run, which is what emails the alert.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://walletofsatoshi.com/.well-known/lnurlp/festiveneon64';
const TARGET = 'static/.well-known/lnurlp/okaybro';
const IDENTIFIER = 'festiveneon64@walletofsatoshi.com';
const CALLBACK_HOSTS = ['livingroomofsatoshi.com', 'walletofsatoshi.com'];

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`${SOURCE} answered ${res.status}`);
const body = await res.text();

// Any of these throwing on a malformed response is also a refusal.
const lnurl = JSON.parse(body);
const callback = new URL(lnurl.callback);
const metadata = JSON.parse(lnurl.metadata);

const problems = [];
if (lnurl.tag !== 'payRequest') problems.push(`tag is ${lnurl.tag}`);
if (callback.protocol !== 'https:' || !CALLBACK_HOSTS.includes(callback.hostname)) {
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
if (problems.length) throw new Error(`refusing the WoS response: ${problems.join('; ')}`);

const changed = readFileSync(TARGET, 'utf8') !== body;
if (changed) writeFileSync(TARGET, body);
console.log(changed ? `updated ${TARGET}` : `${TARGET} is current`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
