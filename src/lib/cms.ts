import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  SHORT_FORM_VIDEOS,
  LONG_FORM_VIDEOS,
  CONTACTS,
  PORTRAIT,
  ABOUT_TEXT,
} from "@/components/portfolio/data";

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
    },
    videos,
    contacts: contacts.filter((c) => c.visible),
  };
}
