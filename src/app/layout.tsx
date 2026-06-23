import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouSystem",
  description: "Your personal life and travel system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className={`${inter.className} min-h-screen overflow-x-hidden`}>
        <ThemeProvider>
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
