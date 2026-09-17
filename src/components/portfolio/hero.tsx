"use client";

import { motion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import type { HeroSettings } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero({ settings }: { settings: HeroSettings }) {
  const { name, tagline, about, avatarUrl, stats } = settings;
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#d9e6ca] pt-16"
      aria-label="Introduction"
    >
      {/* decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#778667]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#778667]/20 blur-3xl"
      />

      {/* giant ghost headline */}
      <span
        aria-hidden
        className="font-display font-wonk text-outline-olive pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[22vw] leading-none opacity-40"
      >
        PORTFOLIO
      </span>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2">
        {/* Portrait — editorial arch frame */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-t-[14rem] rounded-b-[2rem] bg-[#778667]/25" />
          <div className="overflow-hidden rounded-t-[14rem] rounded-b-[2rem] border-[10px] border-[#778667] bg-[#778667]/20 shadow-xl">
            <img
              src={avatarUrl}
              alt={`Portrait of ${name}, creative video editor`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <span className="font-accent absolute -right-3 top-8 -rotate-90 text-lg italic text-[#5f6d52] sm:text-xl">
            est. 2023
          </span>
        </motion.div>

        {/* Large typography block */}
        <div className="text-center lg:text-left">
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-[#5f6d52] sm:text-sm"
          >
            ✦ Hello, I am
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="font-display font-wonk text-[clamp(4.5rem,14vw,11.5rem)] font-semibold leading-[0.85] tracking-tight text-[#778667]"
          >
            {name}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="font-accent mt-4 text-[clamp(1.6rem,4vw,3rem)] italic leading-[1.15] text-[#4a5442]"
          >
            {tagline}
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#4a5442]/90 lg:mx-0 sm:text-lg"
          >
            {about}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <a
              href="#short-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#778667] px-6 py-3 text-sm font-medium text-[#f4f7ee] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#5f6d52] hover:shadow-lg"
            >
              View My Work
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#778667] px-6 py-[10px] text-sm font-medium text-[#4a5442] transition-all hover:-translate-y-0.5 hover:bg-[#778667]/15"
            >
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            {stats.map(
              (stat) => (
                <span
                  key={stat}
                  className="font-accent rounded-full bg-white/60 px-4 py-1.5 text-sm italic text-[#4a5442] ring-1 ring-[#778667]/30 sm:text-base"
                >
                  {stat}
                </span>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
