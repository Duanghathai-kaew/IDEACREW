import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-pink-50 via-white to-slate-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-white/70 bg-white/80 px-8 py-14 text-center shadow-xl shadow-pink-100/60 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-400">
          IDEACREW
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">
          เข้าสู่ระบบสำเร็จ
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          บัญชีของคุณถูกเชื่อมต่อแล้วและ session ถูกบันทึกไว้ใน cookie
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          ไปหน้าโปรเจกต์
        </Link>
      </div>
    </main>
  );
}
