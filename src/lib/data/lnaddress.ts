/** The Lightning address the site serves, which is also its Nostr name: wallets resolve it
 * through .well-known/lnurlp/<name> and Nostr clients through .well-known/nostr.json, both on
 * this domain. It is a BIP 353 name too, through the DNSSEC-signed TXT record
 * okaybro.user._bitcoin-payment.chaitanyakeyal.com. Written out here rather than built from
 * profile.json, which the resume builder owns; a test pins it to the files the site actually
 * serves. */
export const lnaddress = 'okaybro@chaitanyakeyal.com';
