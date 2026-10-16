import { NextResponse } from "next/server";
import { getCurrentSession, sessionUser } from "@/lib/auth/current-session";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({ user: session ? sessionUser(session) : null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
