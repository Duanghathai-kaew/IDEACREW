"use client";

import { ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminLoginAction } from "@/features/admin/actions/admin-login.action";
import { initialAdminLoginState } from "@/features/admin/types/admin-login.type";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-10 w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(
    adminLoginAction,
    initialAdminLoginState,
  );

  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-cyan-50 via-slate-50 to-white" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

      <Card className="w-full max-w-md border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Admin Sign In
          </CardTitle>
          <CardDescription className="text-slate-600">
            Access IDEACREW administration panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-slate-700"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                required
                aria-invalid={Boolean(state.error)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                required
                aria-invalid={Boolean(state.error)}
              />
            </div>

            {state.error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <LoginSubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
