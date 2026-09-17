import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES: Record<string, number | null> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: null,
};

// IST (+5:30) day boundaries — audience is primarily Indian
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istDateKey(t: Date): string {
  return new Date(t.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function istMidnight(now: Date): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

function topN(
  map: Map<string, number>,
  n: number
): { name: string; views: number }[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, views]) => ({ name, views }));
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rangeParam = req.nextUrl.searchParams.get("range") ?? "7d";
  const rangeMs = RANGES[rangeParam] ?? RANGES["7d"];
  const now = new Date();
  const since = rangeMs ? new Date(now.getTime() - rangeMs) : new Date(0);
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

  try {
    const [views, events, allTimeViews, allTimeVisitors, liveRows] =
      await Promise.all([
        db.pageView.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: 100_000,
          select: {
            visitorId: true,
            path: true,
            referrerHost: true,
            country: true,
            countryCode: true,
            city: true,
            device: true,
            browser: true,
            os: true,
            durationSec: true,
            createdAt: true,
          },
        }),
        db.trackEvent.findMany({
          where: { createdAt: { gte: since } },
          take: 50_000,
          select: { name: true, label: true },
        }),
        db.pageView.count(),
        db.pageView
          .groupBy({ by: ["visitorId"], _count: { _all: true } })
          .then((rows) => rows.length),
        db.pageView.findMany({
          where: { createdAt: { gte: fiveMinAgo } },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            visitorId: true,
            path: true,
            country: true,
            countryCode: true,
            city: true,
            device: true,
            browser: true,
            os: true,
            createdAt: true,
          },
        }),
      ]);

    // ---- totals ----------------------------------------------------------
    const visitorSet = new Set<string>();
    let durationSum = 0;
    for (const v of views) {
      visitorSet.add(v.visitorId);
      durationSum += v.durationSec;
    }
    const viewsToday = views.filter((v) => v.createdAt >= istMidnight(now)).length;
    const liveVisitors = new Set(liveRows.map((r) => r.visitorId ?? r.id)).size;

    // ---- daily series ----------------------------------------------------
    const days = rangeMs
      ? Math.min(Math.ceil(rangeMs / (24 * 60 * 60 * 1000)), 60)
      : 60;
    const dailyMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) {
      const key = istDateKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
      dailyMap.set(key, { views: 0, visitors: new Set() });
    }
    for (const v of views) {
      const key = istDateKey(v.createdAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.views += 1;
        entry.visitors.add(v.visitorId);
      }
    }
    const daily = [...dailyMap.entries()].map(([date, d]) => ({
      date,
      views: d.views,
      visitors: d.visitors.size,
    }));

    // ---- breakdowns --------------------------------------------------------
    const pagesMap = new Map<string, number>();
    const sourcesMap = new Map<string, number>();
    const countriesMap = new Map<string, { views: number; visitors: Set<string>; cc: string }>();
    const citiesMap = new Map<string, number>();
    const devicesMap = new Map<string, number>();
    const browsersMap = new Map<string, number>();
    const osMap = new Map<string, number>();

    for (const v of views) {
      pagesMap.set(v.path, (pagesMap.get(v.path) ?? 0) + 1);
      sourcesMap.set(v.referrerHost || "Direct", (sourcesMap.get(v.referrerHost || "Direct") ?? 0) + 1);
      const cKey = v.country || "Unknown";
      const c = countriesMap.get(cKey) ?? { views: 0, visitors: new Set<string>(), cc: v.countryCode };
      c.views += 1;
      c.visitors.add(v.visitorId);
      countriesMap.set(cKey, c);
      if (v.city) {
        const cityKey = `${v.city}, ${v.country}`;
        citiesMap.set(cityKey, (citiesMap.get(cityKey) ?? 0) + 1);
      }
      devicesMap.set(v.device, (devicesMap.get(v.device) ?? 0) + 1);
      browsersMap.set(v.browser, (browsersMap.get(v.browser) ?? 0) + 1);
      osMap.set(v.os, (osMap.get(v.os) ?? 0) + 1);
    }

    // ---- events ------------------------------------------------------------
    const eventsMap = new Map<string, number>();
    for (const e of events) {
      const key = e.label ? `${e.name}::${e.label}` : e.name;
      eventsMap.set(key, (eventsMap.get(key) ?? 0) + 1);
    }
    const topEvents = [...eventsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([key, count]) => {
        const [name, ...rest] = key.split("::");
        return { name, label: rest.join("::"), count };
      });

    // ---- recent views --------------------------------------------------------
    const recent = views.slice(0, 25).map((v) => ({
      path: v.path,
      referrerHost: v.referrerHost || "Direct",
      country: v.country,
      countryCode: v.countryCode,
      city: v.city,
      device: v.device,
      browser: v.browser,
      os: v.os,
      durationSec: v.durationSec,
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totals: {
        views: views.length,
        visitors: visitorSet.size,
        viewsToday,
        avgDuration: views.length ? Math.round(durationSum / views.length) : 0,
        liveVisitors,
        totalEvents: events.length,
        allTimeViews,
        allTimeVisitors,
      },
      daily,
      topPages: topN(pagesMap, 8),
      topSources: topN(sourcesMap, 8),
      countries: [...countriesMap.entries()]
        .sort((a, b) => b[1].views - a[1].views)
        .slice(0, 10)
        .map(([country, d]) => ({
          country,
          countryCode: d.cc,
          views: d.views,
          visitors: d.visitors.size,
        })),
      cities: topN(citiesMap, 8).map((c) => {
        const [city, country] = c.name.split(", ");
        return { city, country: country ?? "", views: c.views };
      }),
      devices: topN(devicesMap, 5),
      browsers: topN(browsersMap, 6),
      os: topN(osMap, 6),
      topEvents,
      recent,
      live: liveRows.map((r) => ({
        id: r.id,
        path: r.path,
        country: r.country,
        countryCode: r.countryCode,
        city: r.city,
        device: r.device,
        browser: r.browser,
        os: r.os,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("analytics error", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
