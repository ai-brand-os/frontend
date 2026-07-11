import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const clashDisplay = localFont({
  variable: "--font-clash",
  src: [
    { path: "../fonts/ClashDisplay-Semibold.woff2", weight: "600" },
    { path: "../fonts/ClashDisplay-Bold.woff2", weight: "700" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Brand OS",
  description: "Build and manage your brand with AI-powered workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} ${clashDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
