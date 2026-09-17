import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  SHORT_FORM_VIDEOS,
  LONG_FORM_VIDEOS,
  CONTACTS,
  PORTRAIT,
  ABOUT_TEXT,
} from "@/components/portfolio/data";
import { parseBlocks, type Block } from "@/lib/blocks";

/** Fallback stats shown in the hero (client can edit these in the CMS) */
export const DEFAULT_STATS = [
  "2+ Years Experience",
  "14+ Projects Delivered",
  "Short & Long Form",
];

export const DEFAULT_ADMIN_PASSWORD = "jaami123";

/**
 * Makes sure every singleton/seed exists so the site always renders,
 * even on a fresh database.
 */
export async function ensureSeed(): Promise<void> {
  // Admin password
  const cfg = await db.adminConfig.findUnique({ where: { id: "main" } });
  if (!cfg) {
    await db.adminConfig.create({
      data: { id: "main", passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD) },
    });
  }

  // Site settings
  const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    await db.siteSettings.create({
      data: {
        id: "main",
        about: ABOUT_TEXT,
        avatarUrl: PORTRAIT,
        whatsappUrl: CONTACTS.whatsapp,
        stats: JSON.stringify(DEFAULT_STATS),
      },
    });
  }

  // Videos
  const videoCount = await db.video.count();
  if (videoCount === 0) {
    await db.video.createMany({
      data: [
        ...SHORT_FORM_VIDEOS.map((v, i) => ({
          type: "short",
          src: v.src,
          sort: i,
        })),
        ...LONG_FORM_VIDEOS.map((v, i) => ({
          type: "long",
          src: v.src,
          sort: i,
        })),
      ],
    });
  }

  // Contact items
  const contactCount = await db.contactItem.count();
  if (contactCount === 0) {
    await db.contactItem.createMany({
      data: [
        {
          type: "instagram",
          label: "@jaami.visuals",
          href: CONTACTS.instagram,
          sort: 0,
        },
        {
          type: "email",
          label: CONTACTS.email,
          href: `mailto:${CONTACTS.email}`,
          sort: 1,
        },
        {
          type: "whatsapp",
          label: CONTACTS.phone,
          href: CONTACTS.whatsapp,
          sort: 2,
        },
      ],
    });
  }
}

export interface PublicSettings {
  name: string;
  tagline: string;
  about: string;
  avatarUrl: string;
  whatsappUrl: string;
  stats: string[];
  shortSubtitle: string;
  longSubtitle: string;
  contactIntro: string;
  logoUrl: string;
  showMarquee: boolean;
  showStats: boolean;
  showShort: boolean;
  showLong: boolean;
  showContact: boolean;
  footerText: string;
}

export interface PublicVideo {
  id: string;
  title: string;
  type: string;
  src: string;
  visible: boolean;
  sort: number;
}

export interface PublicContact {
  id: string;
  type: string;
  label: string;
  href: string;
  visible: boolean;
  sort: number;
}

function parseStats(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.filter((s): s is string => typeof s === "string");
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_STATS;
}

/** Full content used by the public homepage */
export async function getSiteData(): Promise<{
  settings: PublicSettings;
  videos: PublicVideo[];
  contacts: PublicContact[];
}> {
  await ensureSeed();

  const [rawSettings, videos, contacts] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.video.findMany({ orderBy: { sort: "asc" } }),
    db.contactItem.findMany({ orderBy: { sort: "asc" } }),
  ]);

  return {
    settings: {
      name: rawSettings?.name ?? "JAAMI",
      tagline: rawSettings?.tagline ?? "Creative Video Editor",
      about: rawSettings?.about ?? ABOUT_TEXT,
      avatarUrl: rawSettings?.avatarUrl ?? PORTRAIT,
      whatsappUrl: rawSettings?.whatsappUrl ?? CONTACTS.whatsapp,
      stats: parseStats(rawSettings?.stats ?? "[]"),
      shortSubtitle: rawSettings?.shortSubtitle ?? "",
      longSubtitle: rawSettings?.longSubtitle ?? "",
      contactIntro: rawSettings?.contactIntro ?? "",
      logoUrl: rawSettings?.logoUrl ?? "",
      showMarquee: rawSettings?.showMarquee ?? true,
      showStats: rawSettings?.showStats ?? true,
      showShort: rawSettings?.showShort ?? true,
      showLong: rawSettings?.showLong ?? true,
      showContact: rawSettings?.showContact ?? true,
      footerText: rawSettings?.footerText ?? "",
    },
    videos,
    contacts: contacts.filter((c) => c.visible),
  };
}

// ---------------------------------------------------------------------------
// Theme (colors + fonts) — injected as CSS var overrides in the root layout
// ---------------------------------------------------------------------------

export interface ThemeSettings {
  colorOlive: string;
  colorOliveDark: string;
  colorSage: string;
  colorMist: string;
  colorInk: string;
  colorCream: string;
  fontPreset: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const FONT_DISPLAYS: Record<string, string> = {
  fraunces: "var(--font-fraunces)",
  playfair: "var(--font-playfair)",
  dmserif: "var(--font-dmserif)",
  modern: "var(--font-poppins)",
};
const FONT_ACCENTS: Record<string, string> = {
  fraunces: "var(--font-playfair)",
  playfair: "var(--font-fraunces)",
  dmserif: "var(--font-playfair)",
  modern: "var(--font-poppins)",
};

/** CSS var overrides from DB — sanitized; invalid values fall back silently.
 *  Colors: :root var overrides (utilities reference the vars).
 *  Fonts: direct utility overrides (@theme inline inlines values, so the
 *  --font-display var alone would not affect existing classes). */
export async function getThemeCss(): Promise<string> {
  try {
    const s = await db.siteSettings.findUnique({ where: { id: "main" } });
    if (!s) return "";
    const hex = (v: string, fallback: string) =>
      HEX_RE.test(v) ? v : fallback;
    const display = FONT_DISPLAYS[s.fontPreset] ?? FONT_DISPLAYS.fraunces;
    const accent = FONT_ACCENTS[s.fontPreset] ?? FONT_ACCENTS.fraunces;
    return `:root{--color-olive:${hex(s.colorOlive, "#778667")};--color-olive-dark:${hex(
      s.colorOliveDark,
      "#5f6d52"
    )};--color-sage:${hex(s.colorSage, "#d9e6ca")};--color-mist:${hex(
      s.colorMist,
      "#eef3e5"
    )};--color-ink:${hex(s.colorInk, "#4a5442")};--color-cream:${hex(
      s.colorCream,
      "#f4f7ee"
    )}}.font-display{font-family:${display},Georgia,serif!important}.font-accent{font-family:${accent},Georgia,serif!important}`;
  } catch {
    return "";
  }
}

export async function getSeo(): Promise<{ title: string; description: string; faviconUrl: string }> {
  try {
    const s = await db.siteSettings.findUnique({
      where: { id: "main" },
      select: { seoTitle: true, seoDescription: true, faviconUrl: true },
    });
    return {
      title: s?.seoTitle || "JAAMI | Creative Video Editor",
      description:
        s?.seoDescription ||
        "Creative and detail-oriented short form & long form video editor with 2 years of experience.",
      faviconUrl: s?.faviconUrl ?? "",
    };
  } catch {
    return { title: "JAAMI | Creative Video Editor", description: "Creative video editor portfolio.", faviconUrl: "" };
  }
}

// ---------------------------------------------------------------------------
// Editable pages (WordPress-style)
// ---------------------------------------------------------------------------

export interface PublicPage {
  id: string;
  slug: string;
  title: string;
  blocks: Block[];
  showInNav: boolean;
  visible: boolean;
  sort: number;
}

export async function getNavPages(): Promise<{ slug: string; title: string }[]> {
  try {
    const rows = await db.page.findMany({
      where: { visible: true, showInNav: true },
      orderBy: { sort: "asc" },
      select: { slug: true, title: true },
    });
    return rows;
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<PublicPage | null> {
  const row = await db.page.findUnique({ where: { slug } });
  if (!row || !row.visible) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    blocks: parseBlocks(row.blocks),
    showInNav: row.showInNav,
    visible: row.visible,
    sort: row.sort,
  };
}
