import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${geistSans.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
