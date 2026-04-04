export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff";
};

const STORAGE_KEY = "mock_auth_user";

const defaultMockUser: AuthUser = {
  id: "mock-student-001",
  name: "Demo Student",
  email: "demo.student@university.ac.th",
  role: "student",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser | null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!canUseStorage()) return;

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return readStoredUser();
  },

  async signInForDevelopment(user: AuthUser = defaultMockUser): Promise<AuthUser> {
    writeStoredUser(user);
    return user;
  },

  async signOut(): Promise<void> {
    writeStoredUser(null);
  },

  // Future integration point for real university SSO API.
  async exchangeUniversityToken(token: string): Promise<AuthUser> {
    void token;
    throw new Error("University auth API is not connected yet.");
  },
};
