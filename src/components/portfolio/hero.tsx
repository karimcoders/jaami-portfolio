"use client";

import { motion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { ABOUT_TEXT, CONTACTS, PORTRAIT } from "./data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
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

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        {/* Portrait */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-full bg-[#778667]/25" />
          <div className="overflow-hidden rounded-full border-8 border-[#778667] bg-[#778667]/20 shadow-xl">
            <img
              src={PORTRAIT}
              alt="Portrait of JAAMI, creative video editor"
              className="aspect-square w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Text */}
        <div className="text-center lg:text-left">
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#5f6d52]"
          >
            Hello, I am
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-6xl font-bold tracking-[0.12em] text-[#778667] sm:text-7xl lg:text-8xl"
          >
            JAAMI
          </motion.h1>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-4 inline-block rounded-md bg-[#778667] px-5 py-2.5 shadow-sm"
          >
            <span className="text-xl font-light text-[#eef3e5] sm:text-2xl">
              Creative Video Editor
            </span>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#4a5442] lg:mx-0"
          >
            {ABOUT_TEXT}
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
              href={`mailto:${CONTACTS.email}`}
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
            {["2+ Years Experience", "14+ Projects Delivered", "Short & Long Form"].map(
              (stat) => (
                <span
                  key={stat}
                  className="rounded-full bg-white/60 px-4 py-1.5 text-xs font-medium text-[#4a5442] ring-1 ring-[#778667]/30"
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
