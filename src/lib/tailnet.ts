/** The private links behind the hidden `tailnet` command and /okaybro-agent/tailnet/.
 *
 * They are only ever published encrypted, in static/okaybro-agent/tailnet/sealed.json:
 * PBKDF2-SHA256 stretches the owner's password into an AES-256-GCM key, so the repo and the
 * built site carry ciphertext and nothing else. `bun run tailnet:seal` writes that file from a
 * list kept outside the repo. Decryption happens in the visitor's browser; the password never
 * leaves it. (The services themselves are tailnet-only, so this hides the list, it doesn't
 * guard the doors.) */

export interface TailnetLink {
  name: string;
  label: string;
  url: string;
}

export interface Sealed {
  v: 1;
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

export const SEALED_PATH = '/okaybro-agent/tailnet/sealed.json';

/** OWASP's 2023 floor for PBKDF2-SHA256: slow enough to make guessing expensive, still well
 * under a second in a phone browser. */
const ITERATIONS = 600_000;

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function keyFrom(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function seal(
  links: TailnetLink[],
  password: string,
  iterations = ITERATIONS
): Promise<Sealed> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(password, salt, iterations);
  const plain = new TextEncoder().encode(JSON.stringify(links));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return {
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iterations,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(data)
  };
}

/** The links, or null for a wrong password (AES-GCM refuses to decrypt with the wrong key). */
export async function unseal(sealed: Sealed, password: string): Promise<TailnetLink[] | null> {
  try {
    const key = await keyFrom(password, fromBase64(sealed.salt), sealed.iterations);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(sealed.iv) },
      key,
      fromBase64(sealed.data)
    );
    return JSON.parse(new TextDecoder().decode(plain)) as TailnetLink[];
  } catch {
    return null;
  }
}
