import { NextResponse } from "next/server";

type Body = {
  username?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const username = body.username?.trim();
    const password = body.password;
    const tuApiKey = process.env.TU_API_KEY;
    const tuLoginToken = process.env.TU_LOGIN_TOKEN;

    console.log("TU_API_KEY present:", Boolean(tuApiKey));
    console.log("TU_API_KEY length:", tuApiKey ? tuApiKey.length : 0);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 },
      );
    }

    if (!tuApiKey) {
      return NextResponse.json(
        { error: "TU_API_KEY is not configured" },
        { status: 500 },
      );
    }

    if (!tuLoginToken) {
      return NextResponse.json(
        { error: "TU_LOGIN_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let tuRes;

    try {
      tuRes = await fetch("https://restapi.tu.ac.th/api/v1/auth/Ad/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Application-Key": tuApiKey,
        },
        body: JSON.stringify({
          UserName: username,
          PassWord: password,
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "TU API timeout (too slow)" },
          { status: 504 },
        );
      }

      console.error("Fetch error:", err);
      return NextResponse.json({ error: "Network error" }, { status: 500 });
    } finally {
      clearTimeout(timeout);
    }
    // Call TU verify API from the server to avoid CORS and hide the API key
    tuRes = await fetch("https://restapi.tu.ac.th/api/v1/auth/Ad/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-Key": tuApiKey,
      },
      body: JSON.stringify({
        UserName: username,
        PassWord: password,
      }),
    });

    if (!tuRes.ok) {
      if (tuRes.status === 401 || tuRes.status === 403) {
        return NextResponse.json(
          { error: "TU authentication failed" },
          { status: 401 },
        );
      }

      return NextResponse.json(
        { error: "TU API request failed" },
        { status: 500 },
      );
    }
    // Don't log or persist the password

    const tuJson = await tuRes.json().catch(() => null);
    console.log("TU response:", tuJson);
    console.log("TU status code:", tuRes.status);

    // explicit failure handling
    if (!tuJson || tuJson.status !== true) {
      return NextResponse.json(
        { error: tuJson?.message || "Invalid TU credentials" },
        { status: 401 },
      );
    }

    const tuUsername = tuJson.username ?? username;
    const displayname = tuJson.displayname_en ?? "";
    const email = tuJson.email ?? "";

    // sanitize user object to return to client
    const safeUser = {
      username: tuUsername,
      displayname: displayname,
      email,
    };

    // Forward validated user to local /api/login using server-side token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const loginRes = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tu-token": tuLoginToken,
      },
      // request server-side should include redirect instruction
      body: JSON.stringify({
        username: tuUsername,
        displayname,
        email,
      }),
      redirect: "manual",
    });

    // If /api/login redirected, instruct client to navigate to /home and include sanitized user
    if (loginRes.redirected || loginRes.status === 302) {
      return NextResponse.json({
        ...safeUser,
        redirect: true,
        location: "/",
      });
    }

    if (!loginRes.ok) {
      const err = await loginRes.text().catch(() => "Login failed");
      return NextResponse.json(
        { error: err || "Login failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("TU LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
