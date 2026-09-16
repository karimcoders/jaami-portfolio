"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { CONTACTS, INSTAGRAM_LOGO, WHATSAPP_LOGO } from "./data";

const items = [
  {
    icon: (
      <img
        src={INSTAGRAM_LOGO}
        alt=""
        aria-hidden
        className="h-10 w-10 rounded-xl object-cover shadow-md"
      />
    ),
    label: "@jaami.visuals",
    href: CONTACTS.instagram,
    external: true,
  },
  {
    icon: (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md">
        <Mail className="h-5 w-5 text-white" />
      </span>
    ),
    label: CONTACTS.email,
    href: `mailto:${CONTACTS.email}`,
    external: false,
  },
  {
    icon: (
      <img
        src={WHATSAPP_LOGO}
        alt=""
        aria-hidden
        className="h-10 w-10 rounded-xl object-cover shadow-md"
      />
    ),
    label: CONTACTS.phone,
    href: CONTACTS.whatsapp,
    external: true,
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-label="Contact information"
      className="relative overflow-hidden bg-[#778667] py-20 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl font-bold tracking-[0.15em] text-[#eef3e5] sm:text-4xl md:text-5xl"
        >
          CONTACT US
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-3 max-w-xl text-base text-[#eef3e5]/80"
        >
          Have a project in mind? Let&apos;s turn your raw ideas into
          scroll-stopping content. Reach out through any of the channels below.
        </motion.p>

        <div className="mt-10 flex flex-col gap-5">
          {items.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
              className="group flex w-fit items-center gap-5 rounded-2xl p-2 pr-6 transition-colors hover:bg-white/10"
            >
              {item.icon}
              <span className="text-xl font-light text-[#eef3e5] transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                {item.label}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#5f6d52] py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-sm text-[#eef3e5]/75 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} JAAMI Visuals. All rights reserved.</p>
        <p>Creative Video Editor — Short Form &amp; Long Form</p>
      </div>
    </footer>
  );
}
