import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/features/auth/services/session.service";

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function requireCurrentSession() {
  const session = await getCurrentSession();
  if (!session) throw new Error("Please login again");
  return session;
}

export function sessionUser(session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>) {
  return { id: session.userId, name: session.name, email: session.email, tuId: session.tuId, role: session.role };
}
