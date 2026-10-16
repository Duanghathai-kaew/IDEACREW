type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  tuId: string;
  role: "student" | "staff";
  isAdmin: boolean;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = "ideacrew_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error("Missing SESSION_SECRET");
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(input: {
  userId: string;
  email: string;
  name: string;
  tuId: string;
  role?: "student" | "staff";
  isAdmin?: boolean;
}) {
  const now = Date.now();
  const payload: SessionPayload = {
    userId: input.userId,
    email: input.email,
    name: input.name,
    tuId: input.tuId,
    role: input.role ?? "student",
    isAdmin: input.isAdmin ?? false,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadPart = bytesToBase64Url(encoder.encode(payloadJson));
  const key = await importHmacKey(getSessionSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadJson),
  );

  return `${payloadPart}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadPart, signaturePart] = parts;
    if (!payloadPart || !signaturePart) return null;
    const payloadJson = decoder.decode(base64UrlToBytes(payloadPart));
    const key = await importHmacKey(getSessionSecret());
    const isValid = await crypto.subtle.verify(
      "HMAC", key, base64UrlToBytes(signaturePart), encoder.encode(payloadJson),
    );
    if (!isValid) return null;
    const payload = JSON.parse(payloadJson) as SessionPayload;
    if (
      typeof payload.userId !== "string" || !payload.userId ||
      typeof payload.email !== "string" || typeof payload.name !== "string" ||
      typeof payload.tuId !== "string" ||
      !["student", "staff"].includes(payload.role) ||
      typeof payload.isAdmin !== "boolean" ||
      !Number.isFinite(payload.iat) || !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now()
    ) return null;
    return payload;
  } catch {
    return null;
  }
}
