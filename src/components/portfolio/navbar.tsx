"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { trackEvent } from "@/lib/track";

const SECTION_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#short-form", label: "Short Form" },
  { href: "#long-form", label: "Long Form" },
  { href: "#contact", label: "Contact" },
];

export interface NavPageLink {
  slug: string;
  title: string;
}

export function Navbar({
  name,
  whatsappUrl,
  logoUrl = "",
  pages = [],
  isHome = true,
}: {
  name: string;
  whatsappUrl: string;
  logoUrl?: string;
  pages?: NavPageLink[];
  isHome?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anchorPrefix = isHome ? "" : "/";
  const links = [
    ...SECTION_LINKS.map((l) => ({ ...l, href: `${anchorPrefix}${l.href}` })),
    ...pages.map((p) => ({ href: `/${p.slug}`, label: p.title })),
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-sage/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href={isHome ? "#home" : "/"}
          className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          {logoUrl ? (
             
            <img src={logoUrl} alt={`${name} logo`} className="h-9 w-auto max-w-40 object-contain" />
          ) : (
            <span className="font-display font-wonk truncate text-2xl font-semibold tracking-wide text-ink transition-colors hover:text-olive">
              {name}
            </span>
          )}
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ink transition-colors hover:text-olive"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", "Hire Me (navbar)")}
              className="rounded-full bg-olive px-5 py-2 text-sm font-medium text-cream shadow-sm transition-all hover:bg-olive-dark hover:shadow-md"
            >
              Hire Me
            </a>
          </li>
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-olive/15 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-olive/20 bg-sage/95 backdrop-blur-md lg:hidden">
          <ul className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-olive/15"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("cta_click", "Hire Me (navbar)")}
                className="block rounded-full bg-olive px-5 py-2.5 text-center text-sm font-medium text-cream transition-colors hover:bg-olive-dark"
              >
                Hire Me
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
