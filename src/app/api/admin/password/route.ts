import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, hashPassword, isAdmin, tokenFor } from "@/lib/auth";

export const runtime = "nodejs";

/** Change the admin password */
export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { current?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";

  if (next.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const cfg = await db.adminConfig.findUnique({ where: { id: "main" } });
  if (!cfg || hashPassword(current) !== cfg.passwordHash) {
    return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
  }

  const passwordHash = hashPassword(next);
  await db.adminConfig.update({ where: { id: "main" }, data: { passwordHash } });

  // Re-issue the session cookie so the current session stays logged in
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, tokenFor(passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
