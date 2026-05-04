function b64urlEncode(u8: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    const b = u8[i];
    if (b === undefined) continue;
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function deriveHmacKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSessionCookie(
  sessionId: string,
  secret: string,
): Promise<string> {
  const key = await deriveHmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(sessionId),
  );
  return `${sessionId}.${b64urlEncode(new Uint8Array(sig))}`;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined || y === undefined) return false;
    diff |= x ^ y;
  }
  return diff === 0;
}

function b64urlToBytes(s: string): Uint8Array | null {
  try {
    const pad = "===".slice((s.length + 3) % 4);
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

export async function verifySessionCookie(
  raw: string,
  secret: string,
): Promise<string | null> {
  const idx = raw.indexOf(".");
  if (idx === -1) return null;
  const sessionId = raw.slice(0, idx);
  const sigB64 = raw.slice(idx + 1);
  if (!sessionId || !sigB64) return null;
  const sig = b64urlToBytes(sigB64);
  if (!sig) return null;
  const key = await deriveHmacKey(secret);
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(sessionId),
  );
  const expectedBytes = new Uint8Array(expected);
  return timingSafeEqualBytes(sig, expectedBytes) ? sessionId : null;
}
