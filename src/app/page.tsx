import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/hero";
import { Marquee } from "@/components/portfolio/marquee";
import { LongFormSection, ShortFormSection } from "@/components/portfolio/work-sections";
import { ContactSection, Footer } from "@/components/portfolio/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d9e6ca]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <ShortFormSection />
        <LongFormSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
