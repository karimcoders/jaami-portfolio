import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const TYPES = new Set(["instagram", "email", "whatsapp", "link"]);

type Params = { params: Promise<{ id: string }> };

/** Edit a contact item */
export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { type?: string; label?: string; href?: string; visible?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data: { type?: string; label?: string; href?: string; visible?: boolean } = {};

  if (body.type && TYPES.has(body.type)) data.type = body.type;
  if (typeof body.label === "string" && body.label.trim()) data.label = body.label.trim();
  if (typeof body.href === "string" && body.href.trim()) data.href = body.href.trim();
  if (typeof body.visible === "boolean") data.visible = body.visible;

  if (data.type === "email" && data.href && !data.href.startsWith("mailto:")) {
    data.href = `mailto:${data.href}`;
  }

  try {
    const contact = await db.contactItem.update({ where: { id }, data });
    revalidatePath("/");
    return NextResponse.json({ ok: true, contact });
  } catch {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
}

/** Delete a contact item */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.contactItem.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
}
