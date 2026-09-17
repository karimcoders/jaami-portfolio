import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { isValidSlug, slugify } from "@/lib/blocks";

export const runtime = "nodejs";

/** Create a new editable page */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Page title is required" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim() || slugify(title);
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters/numbers/hyphens and not reserved" },
      { status: 400 }
    );
  }

  const exists = await db.page.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: `Slug "/${slug}" already exists` }, { status: 400 });
  }

  const count = await db.page.count();
  const page = await db.page.create({
    data: { title, slug, sort: count },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, page });
}
