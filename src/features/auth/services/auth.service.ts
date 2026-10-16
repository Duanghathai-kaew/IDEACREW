export type AuthUser = {
  id: string;
  name: string;
  email: string;
  tuId?: string;
  role: "student" | "staff";
};

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    // Remove the old TU/mock login cache; the signed cookie is now authoritative.
    try { window.localStorage.removeItem("mock_auth_user"); } catch { /* Storage may be disabled. */ }
    const response = await fetch("/api/session", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load session");
    return (await response.json()).user;
  },
  async signOut(): Promise<void> {
    const response = await fetch("/api/logout", { method: "POST" });
    if (!response.ok) throw new Error("Unable to sign out");
    try { window.localStorage.removeItem("mock_auth_user"); } catch { /* Storage may be disabled. */ }
  },
};
