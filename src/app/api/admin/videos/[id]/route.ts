import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** Edit a video (title / src / visible / type) */
export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { title?: string; src?: string; visible?: boolean; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data: { title?: string; src?: string; visible?: boolean; type?: string } = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.src === "string" && body.src.trim()) data.src = body.src.trim();
  if (typeof body.visible === "boolean") data.visible = body.visible;
  if (body.type === "short" || body.type === "long") data.type = body.type;

  try {
    const video = await db.video.update({ where: { id }, data });
    revalidatePath("/");
    return NextResponse.json({ ok: true, video });
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}

/** Delete a video */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.video.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}
