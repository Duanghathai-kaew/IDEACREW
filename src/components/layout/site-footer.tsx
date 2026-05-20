import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left md:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Image
            src="/logo-text.svg"
            alt="IDEACREW"
            width={140}
            height={48}
            className="h-7 w-auto"
          />
          <p className="max-w-xs text-sm text-slate-500">
            แพลตฟอร์มสำหรับนักศึกษาค้นหาและเข้าร่วมโปรเจกต์
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
          <Link
            href="/"
            className="min-h-11 min-w-11 px-2 py-2 hover:text-(--brand-500)"
          >
            หน้าหลัก
          </Link>
          <Link
            href="/login"
            className="min-h-11 min-w-11 px-2 py-2 hover:text-(--brand-500)"
          >
            เข้าสู่ระบบ
          </Link>
        </nav>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} IDEACREW
        </p>
      </div>
    </footer>
  );
}
