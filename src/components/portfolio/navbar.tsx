"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#short-form", label: "Short Form" },
  { href: "#long-form", label: "Long Form" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#d9e6ca]/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href="#home"
          className="font-display font-wonk text-2xl font-semibold tracking-wide text-[#4a5442] transition-colors hover:text-[#778667]"
        >
          JAAMI
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-[#4a5442] transition-colors hover:text-[#778667]"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://wa.me/917780015030"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#778667] px-5 py-2 text-sm font-medium text-[#f4f7ee] shadow-sm transition-all hover:bg-[#5f6d52] hover:shadow-md"
            >
              Hire Me
            </a>
          </li>
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a5442] transition-colors hover:bg-[#778667]/15 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[#778667]/20 bg-[#d9e6ca]/95 backdrop-blur-md md:hidden">
          <ul className="space-y-1 px-4 py-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#4a5442] transition-colors hover:bg-[#778667]/15"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="https://wa.me/917780015030"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-full bg-[#778667] px-5 py-2.5 text-center text-sm font-medium text-[#f4f7ee] transition-colors hover:bg-[#5f6d52]"
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
