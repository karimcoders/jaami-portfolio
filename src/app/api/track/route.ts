import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  cleanReferrer,
  getClientIp,
  isBot,
  lookupGeo,
  parseUserAgent,
} from "@/lib/analytics";

export const runtime = "nodejs";

const viewSchema = z.object({
  type: z.literal("view"),
  visitorId: z.string().min(8).max(64),
  sessionId: z.string().min(8).max(64),
  path: z.string().max(200).default("/"),
  referrer: z.string().max(500).default(""),
  screen: z.string().max(20).default(""),
  language: z.string().max(20).default(""),
});

const eventSchema = z.object({
  type: z.literal("event"),
  visitorId: z.string().min(8).max(64),
  sessionId: z.string().min(8).max(64),
  name: z.string().min(1).max(60),
  label: z.string().max(200).default(""),
  path: z.string().max(200).default("/"),
});

const heartbeatSchema = z.object({
  type: z.literal("heartbeat"),
  id: z.string().min(8).max(40),
  visibleSec: z.number().int().min(0).max(1800),
});

const bodySchema = z.discriminatedUnion("type", [
  viewSchema,
  eventSchema,
  heartbeatSchema,
]);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const data = parsed.data;

  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) {
    // Dev convenience: allow headless Chrome so local browser testing works.
    // Real bots stay blocked in production.
    const devHeadless =
      process.env.NODE_ENV === "development" && /HeadlessChrome/i.test(ua);
    if (!devHeadless) return new NextResponse(null, { status: 204 });
  }

  try {
    if (data.type === "view") {
      // Never track the admin app
      if (data.path.startsWith("/admin") || data.path.startsWith("/api")) {
        return new NextResponse(null, { status: 204 });
      }

      const ip = getClientIp(req.headers);
      const { device, browser, os } = parseUserAgent(ua);
      const geo = await lookupGeo(ip);

      const row = await db.pageView.create({
        data: {
          visitorId: data.visitorId,
          sessionId: data.sessionId,
          path: data.path.slice(0, 200) || "/",
          referrer: data.referrer.slice(0, 500),
          referrerHost: cleanReferrer(data.referrer),
          country: geo.country,
          countryCode: geo.countryCode,
          city: geo.city,
          device,
          browser,
          os,
          screen: data.screen,
          language: data.language,
        },
      });
      return NextResponse.json({ id: row.id });
    }

    if (data.type === "event") {
      await db.trackEvent.create({
        data: {
          visitorId: data.visitorId,
          sessionId: data.sessionId,
          name: data.name.slice(0, 60),
          label: data.label.slice(0, 200),
          path: data.path.slice(0, 200),
        },
      });
      return new NextResponse(null, { status: 204 });
    }

    // heartbeat → grow duration (monotonic), capped at 30 min
    const existing = await db.pageView.findUnique({
      where: { id: data.id },
      select: { durationSec: true },
    });
    if (existing) {
      await db.pageView.update({
        where: { id: data.id },
        data: {
          durationSec: Math.min(Math.max(existing.durationSec, data.visibleSec), 1800),
        },
      });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[track] error:", err);
    // Analytics must never break the site
    return new NextResponse(null, { status: 204 });
  }
}
