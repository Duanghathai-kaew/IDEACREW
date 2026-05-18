import { NextResponse } from "next/server";

import { supabaseAdminClient } from "@/lib/supabase/admin-client";

type Body = {
  username?: string;
  password?: string;
};

type TuVerifyResponse = {
  status?: boolean;
  message?: string;
  username?: string;
  displayname_en?: string;
  email?: string;
};

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function buildFallbackEmail(username: string) {
  return `${username.toLowerCase()}@tu.local`;
}

async function verifyTuCredentials(input: {
  username: string;
  password: string;
  tuApiKey: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://restapi.tu.ac.th/api/v1/auth/Ad/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-Key": input.tuApiKey,
      },
      body: JSON.stringify({
        UserName: input.username,
        PassWord: input.password,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false as const, status: 401, error: "TU authentication failed" };
      }
      return { ok: false as const, status: 502, error: "TU API request failed" };
    }

    const payload = (await response.json().catch(() => null)) as TuVerifyResponse | null;
    if (!payload || payload.status !== true) {
      return {
        ok: false as const,
        status: 401,
        error: payload?.message || "Invalid TU credentials",
      };
    }

    return { ok: true as const, payload };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false as const, status: 504, error: "TU API timeout (too slow)" };
    }
    return { ok: false as const, status: 500, error: "Network error" };
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureAuthUser(input: {
  email: string;
  displayName: string;
  username: string;
}) {
  const { data: profiles, error: profileLookupError } = await supabaseAdminClient
    .from("profiles")
    .select("id")
    .eq("username", input.username)
    .limit(1);

  if (profileLookupError) {
    throw new Error(profileLookupError.message);
  }

  const existingProfileId = profiles?.[0]?.id as string | undefined;
  if (existingProfileId) {
    const { data, error } = await supabaseAdminClient.auth.admin.getUserById(existingProfileId);
    if (!error && data.user) {
      return data.user.id;
    }
  }

  const { data: created, error: createError } = await supabaseAdminClient.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: {
      username: input.username,
      displayname: input.displayName,
    },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message || "Failed to create auth user");
  }

  return created.user.id;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const username = normalizeText(body.username);
    const password = body.password ?? "";
    const tuApiKey = process.env.TU_API_KEY?.trim();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing username or password" },
        { status: 400 },
      );
    }

    if (!tuApiKey) {
      return NextResponse.json(
        { ok: false, error: "TU_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const tuResult = await verifyTuCredentials({ username, password, tuApiKey });
    if (!tuResult.ok) {
      return NextResponse.json({ ok: false, error: tuResult.error }, { status: tuResult.status });
    }

    const tuUsername = normalizeText(tuResult.payload.username) || username;
    const displayName =
      normalizeText(tuResult.payload.displayname_en) || tuUsername;
    const email =
      normalizeText(tuResult.payload.email) || buildFallbackEmail(tuUsername);

    const authUserId = await ensureAuthUser({
      email,
      displayName,
      username: tuUsername,
    });

    const { error: upsertProfileError } = await supabaseAdminClient.from("profiles").upsert(
      {
        id: authUserId,
        username: tuUsername,
        displayname: displayName,
        email,
        name: displayName,
        student_id: tuUsername,
      },
      { onConflict: "id" },
    );

    if (upsertProfileError) {
      return NextResponse.json(
        { ok: false, error: upsertProfileError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: authUserId,
        username: tuUsername,
        displayname: displayName,
        email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
