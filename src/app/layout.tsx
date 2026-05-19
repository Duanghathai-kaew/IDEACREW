import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthProvider } from "@/features/auth/components/auth-provider";
import { GuestAccessGate } from "@/features/auth/components/guest-access-gate";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "IDEACREW",
  description: "Build Your Dream Team",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="font-sans antialiased bg-[#FFF9F6]">
        <AuthProvider>
          <Suspense fallback={null}>
            <GuestAccessGate>{children}</GuestAccessGate>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
