import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "jotai";
import TabNavigation from "@/components/layout/TabNavigation";
import DataLoader from "@/components/layout/DataLoader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stabana",
  description: "Stabana - Эпик стабилизации и мониторинг задач",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-surface text-foreground">
        <AuthGuard>
          <Provider>
            <DataLoader />
            <TabNavigation />
            <main className="max-w-screen-xl mx-auto px-3 py-3 sm:p-6">{children}</main>
          </Provider>
        </AuthGuard>
      </body>
    </html>
  );
}
