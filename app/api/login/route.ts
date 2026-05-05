import { NextRequest, NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

export const runtime = "nodejs";

type TuLoginRequestBody = {
  username?: string;
  displayname?: string;
  email?: string;
  token?: string;
  tuToken?: string;
  redirect?: boolean;
};

type SupabaseUserRow = {
  id: string;
  email: string;
  name: string;
  tu_id: string;
  created_at: string | null;
};

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function getProvidedToken(request: NextRequest, body: TuLoginRequestBody) {
  const headerToken =
    request.headers.get("x-tu-token") ??
    request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

  return normalizeText(body.token ?? body.tuToken ?? headerToken);
}

async function parseRequestBody(request: NextRequest) {
  try {
    return (await request.json()) as TuLoginRequestBody;
  } catch {
    return null;
  }
}

async function readSupabaseRows<T>(response: Response) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      text || `Supabase request failed with status ${response.status}`,
    );
  }

  return (text ? (JSON.parse(text) as T) : []) as T;
}

async function syncUserToSupabase(input: {
  email: string;
  name: string;
  tuId: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  const authHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const lookupResponse = await fetch(
    `${supabaseUrl}/rest/v1/users?select=id,email,name,tu_id,created_at&email=eq.${encodeURIComponent(input.email)}&limit=1`,
    {
      headers: authHeaders,
      cache: "no-store",
    },
  );

  const existingUsers =
    await readSupabaseRows<SupabaseUserRow[]>(lookupResponse);
  const existingUser = existingUsers[0];

  if (existingUser) {
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(input.email)}`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          email: input.email,
          name: input.name,
          tu_id: input.tuId,
        }),
      },
    );

    const updatedUsers =
      await readSupabaseRows<SupabaseUserRow[]>(updateResponse);
    return updatedUsers[0] ?? existingUser;
  }

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify([
      {
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        tu_id: input.tuId,
        created_at: new Date().toISOString(),
      },
    ]),
  });

  const insertedUsers =
    await readSupabaseRows<SupabaseUserRow[]>(insertResponse);
  const insertedUser = insertedUsers[0];

  if (!insertedUser) {
    throw new Error("Supabase did not return the inserted user");
  }

  return insertedUser;
}

async function buildSessionCookieValue(user: SupabaseUserRow) {
  return createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    tuId: user.tu_id,
  });
}

function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

function shouldRedirectToHome(request: NextRequest, body: TuLoginRequestBody) {
  if (body.redirect === true) return true;

  const acceptHeader = request.headers.get("accept") ?? "";
  return acceptHeader.includes("text/html");
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: "TU login endpoint is alive" },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request);

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = normalizeEmail(body.email);
  const username = normalizeText(body.username);
  const displayName = normalizeText(body.displayname);
  const tuToken = getProvidedToken(request, body);

  if (!email || !username || !displayName) {
    return NextResponse.json(
      {
        ok: false,
        error: "username, displayname, and email are required",
      },
      { status: 400 },
    );
  }

  const expectedTuToken = process.env.TU_LOGIN_TOKEN?.trim();
  if (expectedTuToken && tuToken !== expectedTuToken) {
    return NextResponse.json(
      { ok: false, error: "Invalid TU token" },
      { status: 401 },
    );
  }

  try {
    const user = await syncUserToSupabase({
      email,
      name: displayName,
      tuId: username,
    });

    const sessionToken = await buildSessionCookieValue(user);

    if (shouldRedirectToHome(request, body)) {
      const response = NextResponse.redirect(
        new URL("/home", request.url),
        303,
      );
      attachSessionCookie(response, sessionToken);
      return response;
    }

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tuId: user.tu_id,
        },
        redirectTo: "/home",
      },
      { status: 200 },
    );

    attachSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process TU login";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
