import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "name",
  "tagline",
  "about",
  "avatarUrl",
  "whatsappUrl",
  "stats",
  "shortSubtitle",
  "longSubtitle",
  "contactIntro",
]);

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

  const data: Record<string, string> = {};

  for (const key of ALLOWED) {
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
    data[key] = value.trim();
  }

  // Guardrails — never allow the public site to render with empty essentials
  if (data.name === "") delete data.name;
  if (data.tagline === "") delete data.tagline;
  if (data.avatarUrl === "") delete data.avatarUrl;

  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, settings });
}
