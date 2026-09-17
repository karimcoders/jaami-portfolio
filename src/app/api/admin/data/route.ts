import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { ensureSeed } from "@/lib/cms";

export const runtime = "nodejs";

/** Everything the admin dashboard needs, in one call */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSeed();

  const [settings, videos, contacts, pages] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "main" } }),
    db.video.findMany({ orderBy: { sort: "asc" } }),
    db.contactItem.findMany({ orderBy: { sort: "asc" } }),
    db.page.findMany({ orderBy: { sort: "asc" } }),
  ]);

  let stats: string[] = [];
  try {
    const parsed = JSON.parse(settings?.stats ?? "[]");
    if (Array.isArray(parsed)) {
      stats = parsed.filter((s): s is string => typeof s === "string");
    }
  } catch {
    stats = [];
  }

  return NextResponse.json({
    settings: settings ? { ...settings, stats } : null,
    videos,
    contacts,
    pages: pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      blocks: safeBlocks(p.blocks),
      showInNav: p.showInNav,
      visible: p.visible,
      sort: p.sort,
    })),
  });
}

function safeBlocks(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
