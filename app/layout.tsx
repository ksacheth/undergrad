import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNDERGRAD - Exam Practice App",
  description: "Practice exam-style questions with AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">UNDERGRAD Exam Practice</h1>
            <p className="text-sm text-blue-100">AI-Powered Question Generation & Evaluation</p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
