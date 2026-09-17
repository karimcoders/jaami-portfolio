import type { Metadata } from "next";
import { Geist, Poppins, Fraunces, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsTracker } from "@/components/analytics/tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "JAAMI | Creative Video Editor",
  description:
    "Creative and detail-oriented short form & long form video editor with 2 years of experience specializing in storytelling and visual communication. Turning raw ideas into scroll-stopping content.",
  keywords: [
    "JAAMI",
    "video editor",
    "creative video editor",
    "short form editing",
    "long form editing",
    "reels editor",
    "jaami.visuals",
  ],
  authors: [{ name: "JAAMI" }],
  openGraph: {
    title: "JAAMI | Creative Video Editor",
    description:
      "Short form & long form video editing portfolio — turning raw ideas into scroll-stopping content.",
    siteName: "JAAMI Visuals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${poppins.variable} ${fraunces.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <AnalyticsTracker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
