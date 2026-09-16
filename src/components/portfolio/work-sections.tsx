"use client";

import { motion } from "framer-motion";
import { Clapperboard, Film } from "lucide-react";
import { LONG_FORM_VIDEOS, SHORT_FORM_VIDEOS } from "./data";
import { VideoCard } from "./video-card";

function SectionBanner({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#778667] py-10 sm:py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#eef3e5]">
            {icon}
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-[0.18em] text-[#eef3e5] sm:text-3xl md:text-4xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#eef3e5]/80">{subtitle}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ShortFormSection() {
  return (
    <section id="short-form" aria-label="Short form video editing portfolio">
      <SectionBanner
        icon={<Clapperboard className="h-6 w-6" />}
        title="SHORT FORM EDITING"
        subtitle="Scroll-stopping reels, shorts & vertical content"
      />
      <div className="bg-[#d9e6ca] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHORT_FORM_VIDEOS.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
              >
                <VideoCard src={video.src} aspect="portrait" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LongFormSection() {
  return (
    <section id="long-form" aria-label="Long form video editing portfolio">
      <SectionBanner
        icon={<Film className="h-6 w-6" />}
        title="LONG FORM EDITING"
        subtitle="Story-driven long form edits & brand films"
      />
      <div className="bg-[#d9e6ca] py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col gap-8">
            {LONG_FORM_VIDEOS.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <VideoCard src={video.src} aspect="video" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
