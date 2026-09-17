"use client";

import { motion } from "framer-motion";
import { Clapperboard, Film } from "lucide-react";
import type { VideoItem } from "./types";
import { VideoCard } from "./video-card";

function SectionBanner({
  icon,
  title,
  accent,
  subtitle,
  number,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  subtitle: string;
  number: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-olive py-12 sm:py-16"
    >
      <span
        aria-hidden
        className="font-display font-wonk text-outline-cream pointer-events-none absolute -top-6 right-4 select-none text-[clamp(5rem,14vw,10rem)] leading-none opacity-25 sm:right-10"
      >
        {number}
      </span>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-mist">
            {icon}
          </span>
          <div>
            <h2 className="font-display font-wonk text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.02] tracking-tight text-mist">
              {title}{' '}<span className="font-accent font-normal italic text-sage">{accent}</span>
            </h2>
            <p className="font-accent mt-2 text-lg italic text-mist/80 sm:text-xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ShortFormSection({
  videos,
  subtitle,
}: {
  videos: VideoItem[];
  subtitle: string;
}) {
  return (
    <section id="short-form" aria-label="Short form video editing portfolio">
      <SectionBanner
        icon={<Clapperboard className="h-6 w-6" />}
        title="SHORT FORM"
        accent="editing"
        subtitle={subtitle}
        number="01"
      />
      <div className="bg-sage py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {videos.length === 0 ? (
            <p className="font-accent py-10 text-center text-xl italic text-ink/70">
              Videos coming soon ✦
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, i) => (
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
          )}
        </div>
      </div>
    </section>
  );
}

export function LongFormSection({
  videos,
  subtitle,
}: {
  videos: VideoItem[];
  subtitle: string;
}) {
  return (
    <section id="long-form" aria-label="Long form video editing portfolio">
      <SectionBanner
        icon={<Film className="h-6 w-6" />}
        title="LONG FORM"
        accent="editing"
        subtitle={subtitle}
        number="02"
      />
      <div className="bg-sage py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {videos.length === 0 ? (
            <p className="font-accent py-10 text-center text-xl italic text-ink/70">
              Videos coming soon ✦
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {videos.map((video, i) => (
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
          )}
        </div>
      </div>
    </section>
  );
}
