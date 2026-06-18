import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MailCmd Inbox",
  description: "Production-grade hackathon command center & inbox",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user || null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
        {user && <Sidebar user={user} />}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
          {children}
        </main>
      </body>
    </html>
  );
}
