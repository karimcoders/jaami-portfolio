import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Save a new order for contact items: { ids: [...] } */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ids = body.ids;
  if (!Array.isArray(ids) || ids.some((v) => typeof v !== "string")) {
    return NextResponse.json({ error: "ids must be a string array" }, { status: 400 });
  }

  await db.$transaction(
    (ids as string[]).map((id, index) =>
      db.contactItem.update({ where: { id }, data: { sort: index } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
