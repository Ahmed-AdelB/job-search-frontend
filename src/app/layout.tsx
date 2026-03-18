/**
 * Root Layout - JobFlow
 * Author: Ahmed Adel Bakr Alderai
 */

import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ClientProvider from "./client-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
});

export const metadata: Metadata = {
  title: "JobFlow - AI Job Search Automation",
  description: "Automate your job search with AI-powered agents. Find, apply, and track job opportunities effortlessly.",
  keywords: ["job search", "automation", "AI", "career", "job applications"],
  authors: [{ name: "Ahmed Adel Bakr Alderai" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansArabic.variable} antialiased min-h-screen`}
      >
        <ClientProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={5000}
            />
          </TooltipProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
