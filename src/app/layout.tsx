import type { Metadata } from "next";
import { Geist, Poppins, Fraunces, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsTracker } from "@/components/analytics/tracker";
import { getSeo, getThemeCss } from "@/lib/cms";

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

const dmSerif = DM_Serif_Display({
  variable: "--font-dmserif",
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  return {
    title: seo.title,
    description: seo.description,
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
      title: seo.title,
      description: seo.description,
      siteName: "JAAMI Visuals",
      type: "website",
    },
    ...(seo.faviconUrl ? { icons: [{ rel: "icon", url: seo.faviconUrl }] } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCss = await getThemeCss();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${poppins.variable} ${fraunces.variable} ${playfair.variable} ${dmSerif.variable} antialiased bg-background text-foreground`}
      >
        {themeCss ? (
          <style
            // Editable theme (colors + fonts) from the admin Design tab.
            // Rendered first in <body> so it overrides the stylesheet defaults.
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        ) : null}
        <AnalyticsTracker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
