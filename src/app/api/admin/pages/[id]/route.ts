import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { blocksArraySchema, isValidSlug } from "@/lib/blocks";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** Update a page — title, slug, blocks, visibility, nav */
export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: {
    title?: string;
    slug?: string;
    blocks?: unknown;
    showInNav?: boolean;
    visible?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await db.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const data: Record<string, string | boolean> = {};

  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    data.title = title;
  }

  if (body.slug !== undefined) {
    const slug = body.slug.trim();
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid or reserved slug" }, { status: 400 });
    }
    if (slug !== existing.slug) {
      const clash = await db.page.findUnique({ where: { slug } });
      if (clash) {
        return NextResponse.json({ error: `Slug "/${slug}" already exists` }, { status: 400 });
      }
    }
    data.slug = slug;
  }

  if (body.blocks !== undefined) {
    const parsed = blocksArraySchema.safeParse(body.blocks);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid blocks content" }, { status: 400 });
    }
    data.blocks = JSON.stringify(parsed.data);
  }

  if (typeof body.showInNav === "boolean") data.showInNav = body.showInNav;
  if (typeof body.visible === "boolean") data.visible = body.visible;

  const page = await db.page.update({ where: { id }, data });

  revalidatePath("/");
  revalidatePath(`/${page.slug}`);
  return NextResponse.json({ ok: true, page });
}

/** Delete a page */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await db.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await db.page.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
