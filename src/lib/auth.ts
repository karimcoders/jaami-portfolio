import { createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "jaami_admin_session";
const TOKEN_SECRET = "jaami-cms-v1";

/** sha256 hash of the plain password (stored in AdminConfig) */
export function hashPassword(password: string): string {
  return createHash("sha256").update(`jaami::${password}`).digest("hex");
}

/** Session token derived from the current password hash */
export function tokenFor(passwordHash: string): string {
  return createHash("sha256")
    .update(`${passwordHash}::${TOKEN_SECRET}`)
    .digest("hex");
}

/** Returns true when the request carries a valid admin session cookie */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const cfg = await db.adminConfig.findUnique({ where: { id: "main" } });
  if (!cfg) return false;

  return token === tokenFor(cfg.passwordHash);
}
