"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { signInForDevelopment } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "กรุณาป้อนอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!password.trim()) {
      newErrors.password = "กรุณาป้อนรหัสผ่าน";
    } else if (password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Log form data (no API connection yet)
      console.log("Login attempt:", { email, password });

      // Mock sign in for development
      await signInForDevelopment();
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          อีเมล
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="student@university.ac.th"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className="pl-10"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            รหัสผ่าน
          </label>
          <a
            href="#"
            className="text-xs text-red-400 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log("Forgot password clicked");
            }}
          >
            ลืมรหัสผ่าน?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            className="pl-10 pr-10"
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-500">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-red-400 to-red-300 py-2.5 text-white hover:from-red-500 hover:to-red-400 transition-all rounded-xl font-medium"
        disabled={isLoading}
      >
        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs text-slate-500">หรือ</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Register Section */}
      <div className="space-y-3">
        <p className="text-center text-sm text-slate-600">ยังไม่มีบัญชี?</p>
        <Button
          type="button"
          variant="outline"
          className="w-full border-red-400 text-red-400 hover:bg-red-50 rounded-xl font-medium"
          onClick={() => router.push("/register")}
          disabled={isLoading}
        >
          สมัครสมาชิกใหม่
        </Button>
      </div>
    </form>
  );
}
