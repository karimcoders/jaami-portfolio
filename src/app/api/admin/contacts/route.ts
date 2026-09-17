import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const TYPES = new Set(["instagram", "email", "whatsapp", "link"]);

/** Add a new contact item */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { type?: string; label?: string; href?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const type = body.type && TYPES.has(body.type) ? body.type : "link";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  let href = typeof body.href === "string" ? body.href.trim() : "";

  if (!label || !href) {
    return NextResponse.json({ error: "Label and link are required" }, { status: 400 });
  }

  // Email type gets a mailto: automatically if missing
  if (type === "email" && !href.startsWith("mailto:")) {
    href = `mailto:${href}`;
  }

  const max = await db.contactItem.findFirst({
    orderBy: { sort: "desc" },
    select: { sort: true },
  });

  const contact = await db.contactItem.create({
    data: { type, label, href, sort: (max?.sort ?? -1) + 1 },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, contact });
}
