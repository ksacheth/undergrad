import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Undergrad Practice Studio",
  description: "Generate and grade exam-style questions with Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        <div className="min-h-screen bg-slate-950">
          <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Undergrad AI Coach
                </p>
                <h1 className="text-2xl font-semibold text-white">Practice Studio</h1>
              </div>
              <p className="text-sm text-slate-300">
                Powered by Google Gemini · Server-secure grading
              </p>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
