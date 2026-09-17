import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const STRING_FIELDS = new Set([
  "name",
  "tagline",
  "about",
  "avatarUrl",
  "whatsappUrl",
  "stats",
  "shortSubtitle",
  "longSubtitle",
  "contactIntro",
  // branding
  "logoUrl",
  "faviconUrl",
  // theme
  "colorOlive",
  "colorOliveDark",
  "colorSage",
  "colorMist",
  "colorInk",
  "colorCream",
  "fontPreset",
  // seo / footer
  "seoTitle",
  "seoDescription",
  "footerText",
]);

const BOOLEAN_FIELDS = new Set([
  "showMarquee",
  "showStats",
  "showShort",
  "showLong",
  "showContact",
]);

const COLOR_FIELDS = new Set([
  "colorOlive",
  "colorOliveDark",
  "colorSage",
  "colorMist",
  "colorInk",
  "colorCream",
]);

const FONT_PRESETS = new Set(["fraunces", "playfair", "dmserif", "modern"]);
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data: Record<string, string | boolean> = {};

  for (const key of STRING_FIELDS) {
    const value = body[key];
    if (value === undefined) continue;

    if (key === "stats") {
      if (!Array.isArray(value) || value.some((s) => typeof s !== "string")) {
        return NextResponse.json({ error: "stats must be a string array" }, { status: 400 });
      }
      data.stats = JSON.stringify((value as string[]).map((s) => s.trim()).filter(Boolean));
      continue;
    }

    if (typeof value !== "string") {
      return NextResponse.json({ error: `${key} must be a string` }, { status: 400 });
    }
    const trimmed = value.trim();

    if (COLOR_FIELDS.has(key) && trimmed !== "" && !HEX_RE.test(trimmed)) {
      return NextResponse.json({ error: `${key} must be a hex color like #778667` }, { status: 400 });
    }
    if (key === "fontPreset" && !FONT_PRESETS.has(trimmed)) {
      return NextResponse.json({ error: "Unknown font preset" }, { status: 400 });
    }
    data[key] = trimmed;
  }

  for (const key of BOOLEAN_FIELDS) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value !== "boolean") {
      return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 });
    }
    data[key] = value;
  }

  // Guardrails — never allow the public site to render with empty essentials
  if (data.name === "") delete data.name;
  if (data.tagline === "") delete data.tagline;
  if (data.avatarUrl === "") delete data.avatarUrl;
  if (data.fontPreset === "") delete data.fontPreset;
  for (const key of COLOR_FIELDS) {
    if (data[key] === "") delete data[key];
  }

  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, settings });
}
