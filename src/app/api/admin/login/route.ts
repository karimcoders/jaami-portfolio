import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, hashPassword, tokenFor } from "@/lib/auth";
import { ensureSeed } from "@/lib/cms";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureSeed();

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const cfg = await db.adminConfig.findUnique({ where: { id: "main" } });
  if (!cfg || hashPassword(password) !== cfg.passwordHash) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, tokenFor(cfg.passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
