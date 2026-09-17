"use client";

import { motion } from "framer-motion";
import { Globe, Mail } from "lucide-react";
import { INSTAGRAM_LOGO, WHATSAPP_LOGO } from "./data";
import { trackEvent } from "@/lib/track";
import type { ContactData } from "./types";

function ContactIcon({ type }: { type: string }) {
  if (type === "instagram") {
    return (
      <img
        src={INSTAGRAM_LOGO}
        alt=""
        aria-hidden
        className="h-10 w-10 rounded-xl object-cover shadow-md"
      />
    );
  }
  if (type === "whatsapp") {
    return (
      <img
        src={WHATSAPP_LOGO}
        alt=""
        aria-hidden
        className="h-10 w-10 rounded-xl object-cover shadow-md"
      />
    );
  }
  if (type === "email") {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md">
        <Mail className="h-5 w-5 text-white" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-dark shadow-md">
      <Globe className="h-5 w-5 text-mist" />
    </span>
  );
}

export function ContactSection({
  contacts,
  intro,
}: {
  contacts: ContactData[];
  intro: string;
}) {
  return (
    <section
      id="contact"
      aria-label="Contact information"
      className="relative overflow-hidden bg-olive py-20 sm:py-24"
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
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-xs font-medium uppercase tracking-[0.4em] text-sage sm:text-sm"
        >
          ✦ Contact us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="font-display font-wonk mt-4 text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95] tracking-tight text-mist"
        >
          LET&apos;S WORK
          <br />
          <span className="font-accent font-normal italic text-sage">
            together
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-5 max-w-xl text-base text-mist/85 sm:text-lg"
        >
          {intro}
        </motion.p>

        <div className="mt-10 flex flex-col gap-5">
          {contacts.map((item, i) => {
            const external = !item.href.startsWith("mailto:");
            return (
              <motion.a
                key={item.id}
                href={item.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => trackEvent("contact_click", `${item.type}:${item.label}`)}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
                className="group flex w-fit items-center gap-5 rounded-2xl p-2 pr-6 transition-colors hover:bg-white/10"
              >
                <ContactIcon type={item.type} />
                <span className="font-accent text-[clamp(1.4rem,3.5vw,2.4rem)] italic leading-snug text-mist transition-transform duration-300 group-hover:translate-x-1">
                  {item.label}
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer({
  name,
  tagline,
  logoUrl = "",
  footerText = "",
}: {
  name: string;
  tagline: string;
  logoUrl?: string;
  footerText?: string;
}) {
  return (
    <footer className="bg-olive-dark py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-sm text-mist/75 sm:flex-row sm:px-6">
        {logoUrl ? (
           
          <img src={logoUrl} alt={`${name} logo`} className="h-8 w-auto max-w-32 object-contain" />
        ) : (
          <p className="font-display font-wonk text-lg tracking-wide text-mist/90">
            {name}
          </p>
        )}
        <p>
          {footerText.trim() ||
            `© ${new Date().getFullYear()} ${name} Visuals. All rights reserved.`}
        </p>
        <p className="font-accent italic">{tagline} — Short &amp; Long Form</p>
      </div>
    </footer>
  );
}
