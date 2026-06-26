import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "SaaS Cours | Cours en ligne & sessions privées",
  description:
    "Plateforme de cours en ligne et de réservation de sessions privées avec instructeurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable, playfair.variable)}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
