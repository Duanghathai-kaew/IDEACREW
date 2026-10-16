import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/features/auth/services/session.service";

export const runtime = "nodejs";

type LoginBody = {
  username?: string;
  password?: string;
};

const FALLBACK_USER_ID = "e68cc396-34e4-4a9f-aa8b-8819c07812ca";

function normalize(value: string | undefined) {
  return value?.trim() ?? "";
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const username = normalize(body.username);
  const password = normalize(body.password);
  const expectedUsername = normalize(process.env.ADMIN_USERNAME);
  const expectedPassword = normalize(process.env.ADMIN_PASSWORD);

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Username and password are required" },
      { status: 400 },
    );
  }

  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json(
      { ok: false, error: "Login is not configured" },
      { status: 500 },
    );
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const displayName = username;
  const email = `${username.toLowerCase()}@ideacrew.local`;
  const userId = normalize(process.env.ADMIN_USER_ID) || FALLBACK_USER_ID;
  const sessionToken = await createSessionToken({
    userId,
    email,
    name: displayName,
    tuId: username,
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: userId,
      name: displayName,
      email,
      tuId: username,
      role: "staff",
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
