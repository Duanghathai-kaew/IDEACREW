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

    // Call TU verify API from the server to avoid CORS and hide the API key
    const tuRes = await fetch(
      "https://restapi.tu.ac.th/api/v1/auth/Ad/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Application-Key": tuApiKey,
        },
        body: JSON.stringify({
          UserName: username,
          PassWord: password,
        }),
      },
    );

    // Don't log or persist the password

    const tuJson = await tuRes.json().catch(() => null);
    console.log("TU response:", tuJson);

    // explicit failure handling
    if (!tuJson || tuJson.status !== true) {
      return NextResponse.json(
        { error: "Invalid TU credentials" },
        { status: 401 },
      );
    }

    const tuUsername = tuJson.username ?? username;
    const displayname = tuJson.displayname_en ?? "";
    const email = tuJson.email ?? username;

    // sanitize user object to return to client
    const safeUser = {
      username: tuUsername,
      displayname: displayname,
      email,
    };

    // Forward validated user to local /api/login using server-side token
    const origin = new URL(req.url).origin;
    const loginRes = await fetch(`${origin}/api/login`, {
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
        location: "/home",
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
