// Server-side analytics helpers: user-agent parsing, client IP extraction,
// and geo-IP lookup (cached, graceful fallback).

export interface UaInfo {
  device: string; // Desktop | Mobile | Tablet
  browser: string;
  os: string;
}

export interface GeoInfo {
  country: string;
  countryCode: string;
  city: string;
}

const BOT_RE =
  /bot|crawler|spider|crawling|headless|lighthouse|pagespeed|preview|curl|wget|python-requests|axios|node-fetch|semrush|ahrefs|pingdom|uptime/i;

export function isBot(ua: string): boolean {
  return BOT_RE.test(ua);
}

export function parseUserAgent(rawUa: string): UaInfo {
  const ua = rawUa || "";

  // ---- Browser -----------------------------------------------------------
  let browser = "Unknown";
  if (/Edg(?:A|iOS)?\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
  else if (/CriOS\//.test(ua)) browser = "Chrome";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";
  else if (/MSIE |Trident\//.test(ua)) browser = "IE";

  // ---- OS ----------------------------------------------------------------
  let os = "Unknown";
  if (/Windows NT|Windows Phone/.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  // ---- Device --------------------------------------------------------------
  let device = "Desktop";
  if (/iPad|Tablet|PlayBook|Silk/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) {
    device = "Tablet";
  } else if (/Mobi|iPhone|iPod|Windows Phone|IEMobile/.test(ua)) {
    device = "Mobile";
  }

  return { device, browser, os };
}

/** Extract best-guess client IP from proxy headers. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-vercel-forwarded-for")?.trim() ||
    ""
  );
}

const PRIVATE_IP_RE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|localhost$|0\.0\.0\.0$|fc00:|fe80:)/i;

// ---------------------------------------------------------------------------
// Geo-IP via ip-api.com (free, no key). Cached in-memory for 24h to respect
// the 45 req/min limit. Every failure degrades gracefully to "Unknown".
// ---------------------------------------------------------------------------

const geoCache = new Map<string, { geo: GeoInfo; ts: number }>();
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

const LOCAL_GEO: GeoInfo = { country: "Local network", countryCode: "", city: "" };
const UNKNOWN_GEO: GeoInfo = { country: "Unknown", countryCode: "", city: "" };

export async function lookupGeo(ip: string): Promise<GeoInfo> {
  if (!ip) return UNKNOWN_GEO;
  if (PRIVATE_IP_RE.test(ip)) return LOCAL_GEO;

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_TTL_MS) return cached.geo;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`,
      { signal: ctrl.signal, cache: "no-store" }
    );
    clearTimeout(timer);
    const json = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
    };

    const geo: GeoInfo =
      json.status === "success" && json.country
        ? {
            country: String(json.country).slice(0, 60),
            countryCode: String(json.countryCode ?? "").slice(0, 2).toUpperCase(),
            city: String(json.city ?? "").slice(0, 60),
          }
        : UNKNOWN_GEO;

    geoCache.set(ip, { geo, ts: Date.now() });
    // keep cache bounded
    if (geoCache.size > 5000) {
      const oldest = [...geoCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) geoCache.delete(oldest[0]);
    }
    return geo;
  } catch {
    // Don't cache failures — retry next visit
    return UNKNOWN_GEO;
  }
}

// ---------------------------------------------------------------------------
// Referrer → friendly source name
// ---------------------------------------------------------------------------

const SOURCE_MAP: Array<[RegExp, string]> = [
  [/google\./i, "Google"],
  [/bing\./i, "Bing"],
  [/duckduckgo\./i, "DuckDuckGo"],
  [/yahoo\./i, "Yahoo"],
  [/instagram\./i, "Instagram"],
  [/facebook\.|fb\.me|fbclid/i, "Facebook"],
  [/whatsapp\.|wa\.me/i, "WhatsApp"],
  [/twitter\.com|x\.com|t\.co/i, "X / Twitter"],
  [/linkedin\./i, "LinkedIn"],
  [/youtube\.|youtu\.be/i, "YouTube"],
  [/tiktok\./i, "TikTok"],
  [/chatgpt\.com|openai\.com/i, "ChatGPT"],
  [/telegram\.|t\.me/i, "Telegram"],
  [/pinterest\./i, "Pinterest"],
  [/reddit\./i, "Reddit"],
  [/mail\.|gmail\./i, "Email"],
];

export function cleanReferrer(raw: string): string {
  if (!raw) return "Direct";
  let host = raw;
  try {
    host = new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    // raw wasn't a full URL — use as-is
    host = raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
  for (const [re, name] of SOURCE_MAP) {
    if (re.test(host) || re.test(raw)) return name;
  }
  return host.slice(0, 60) || "Direct";
}
