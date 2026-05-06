"use client";

import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/authService";
import { useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call server-side route which hides TU API key and avoids CORS issues
      const res = await fetch("/api/tu-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        setLoading(false);
        return;
      }

      const user = data?.user;
      if (user) {
        await authService.signInForDevelopment({
          id: user.username,
          name: user.displayname,
          email: user.email,
          role: "student",
        });
      }

      window.location.assign(data?.location ?? "/");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="mb-4 text-sm text-slate-600 text-center">
        เข้าสู่ระบบด้วยบัญชี TU
      </p>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2"
          aria-label="username"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2"
          aria-label="password"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <Button
        type="submit"
        className="w-full rounded-xl py-2.5"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
