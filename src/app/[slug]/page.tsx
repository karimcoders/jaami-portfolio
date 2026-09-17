import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/portfolio/navbar";
import { PageBlocks } from "@/components/portfolio/page-blocks";
import { Footer } from "@/components/portfolio/contact";
import { getNavPages, getPageBySlug, getSiteData } from "@/lib/cms";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPageBySlug(slug);
    if (!page) return {};
    return {
      title: `${page.title} | JAAMI Visuals`,
      description: `Read more about ${page.title} on JAAMI's portfolio.`,
    };
  } catch {
    return {};
  }
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  const [page, { settings }, navPages] = await Promise.all([
    getPageBySlug(slug),
    getSiteData(),
    getNavPages(),
  ]);

  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-sage">
      <Navbar
        name={settings.name}
        whatsappUrl={settings.whatsappUrl}
        logoUrl={settings.logoUrl}
        pages={navPages}
        isHome={false}
      />
      <main className="flex-1">
        {/* page hero band */}
        <section className="bg-olive pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-sage">
              ✦ {settings.name}
            </p>
            <h1 className="font-display font-wonk mt-3 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-cream">
              {page.title}
            </h1>
          </div>
        </section>
        <PageBlocks blocks={page.blocks} />
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
