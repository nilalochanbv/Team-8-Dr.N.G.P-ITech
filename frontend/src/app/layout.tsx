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
  title: "SkillOS – AI Employability Twin Ecosystem",
  description: "Build. Simulate. Improve. Get Hired. Leverage agentic AI interviews, real-time chaos scoring, and peer squad collaboration.",
  keywords: ["AI Twin", "Employability", "Technical Interview Simulator", "Chaos Score", "Next.js 15", "Student Dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${geistSans.className} ${geistMono.variable} min-h-screen text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
