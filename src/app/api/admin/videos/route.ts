import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Add a new video */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { type?: string; src?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const type = body.type === "long" ? "long" : "short";
  const src = typeof body.src === "string" ? body.src.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!src) {
    return NextResponse.json({ error: "Video source (upload or URL) is required" }, { status: 400 });
  }

  const max = await db.video.findFirst({
    where: { type },
    orderBy: { sort: "desc" },
    select: { sort: true },
  });

  const video = await db.video.create({
    data: { type, src, title, sort: (max?.sort ?? -1) + 1 },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, video });
}
