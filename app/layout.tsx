import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { GuestAccessGate } from "@/components/auth/GuestAccessGate";

import "./globals.css";

export const metadata: Metadata = {
  title: "IDEACREW",
  description: "Build Your Dream Team",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
