import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { Marquee } from "@/components/portfolio/marquee";
import { LongFormSection, ShortFormSection } from "@/components/portfolio/work-sections";
import { ContactSection, Footer } from "@/components/portfolio/contact";
import { getNavPages, getSiteData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ settings, videos, contacts }, navPages] = await Promise.all([
    getSiteData(),
    getNavPages(),
  ]);

  const shortVideos = videos
    .filter((v) => v.type === "short" && v.visible)
    .map((v) => ({ id: v.id, title: v.title, type: v.type, src: v.src }));
  const longVideos = videos
    .filter((v) => v.type === "long" && v.visible)
    .map((v) => ({ id: v.id, title: v.title, type: v.type, src: v.src }));

  return (
    <div className="flex min-h-screen flex-col bg-sage">
      <Navbar
        name={settings.name}
        whatsappUrl={settings.whatsappUrl}
        logoUrl={settings.logoUrl}
        pages={navPages}
        isHome
      />
      <main className="flex-1">
        <Hero
          settings={{
            name: settings.name,
            tagline: settings.tagline,
            about: settings.about,
            avatarUrl: settings.avatarUrl,
            stats: settings.showStats ? settings.stats : [],
          }}
        />
        {settings.showMarquee && <Marquee />}
        {settings.showShort && (
          <ShortFormSection videos={shortVideos} subtitle={settings.shortSubtitle} />
        )}
        {settings.showLong && (
          <LongFormSection videos={longVideos} subtitle={settings.longSubtitle} />
        )}
        {settings.showContact && (
          <ContactSection contacts={contacts} intro={settings.contactIntro} />
        )}
      </main>
      <Footer
        name={settings.name}
        tagline={settings.tagline}
        logoUrl={settings.logoUrl}
        footerText={settings.footerText}
      />
    </div>
  );
}
