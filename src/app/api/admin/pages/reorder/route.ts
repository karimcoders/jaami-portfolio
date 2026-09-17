import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Reorder pages: { ids: string[] } in desired order */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ids = body.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "ids must be a string array" }, { status: 400 });
  }

  await Promise.all(
    ids.map((id, index) => db.page.update({ where: { id }, data: { sort: index } }))
  );

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
