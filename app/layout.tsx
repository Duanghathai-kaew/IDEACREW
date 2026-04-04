import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

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
    <html lang="th" className={prompt.variable}>
      <body className="font-sans antialiased bg-[#FFF9F6]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
