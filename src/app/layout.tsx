import type { Metadata } from "next";

import { Header } from "@/components/header";
import { getHeaderSessionData } from "@/lib/data";
import { cn } from "@/lib/utils";

import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ToolShare",
  description: "A neighborhood lending library for tools, gear, and everyday resources."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await getHeaderSessionData();

  return (
    <html lang="en">
      <body className={cn("font-sans text-ink antialiased")}>
        <div className="relative flex min-h-screen flex-col">
          <Header
            profile={sessionData.profile}
            unreadIncomingCount={sessionData.unreadIncomingCount}
            user={sessionData.user}
          />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster closeButton richColors position="top-right" />
      </body>
    </html>
  );
}
