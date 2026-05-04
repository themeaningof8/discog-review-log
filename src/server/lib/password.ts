const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function b64urlEncode(u8: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    const b = u8[i];
    if (b === undefined) continue;
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = "===".slice((s.length + 3) % 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

async function deriveKey(
  plain: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations,
    },
    baseKey,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(plain, salt, ITERATIONS);
  return `pbkdf2$sha256$${ITERATIONS}$${b64urlEncode(salt)}$${b64urlEncode(key)}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }
  const iterations = Number(parts[2]);
  if (!Number.isFinite(iterations)) return false;
  const saltPart = parts[3];
  const expectedPart = parts[4];
  if (!saltPart || !expectedPart) return false;
  const salt = b64urlDecode(saltPart);
  const expected = b64urlDecode(expectedPart);
  const actual = await deriveKey(plain, salt, iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const e = expected[i];
    if (a === undefined || e === undefined) return false;
    diff |= a ^ e;
  }
  return diff === 0;
}
