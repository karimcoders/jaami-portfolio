import { z } from "zod";

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

const payload = {
  type: "view",
  visitorId: "test-visitor-12345",
  sessionId: "test-session-1234",
  path: "/",
  referrer: "https://google.com/",
  screen: "1920x1080",
  language: "en-US",
};

const r = bodySchema.safeParse(payload);
if (r.success) {
  console.log("OK", JSON.stringify(r.data));
} else {
  console.log("FAIL", JSON.stringify(r.error.issues, null, 2));
}

// also test bot regex
const BOT_RE =
  /bot|crawler|spider|crawling|headless|lighthouse|pagespeed|preview|curl|wget|python-requests|axios|node-fetch|semrush|ahrefs|pingdom|uptime/i;
const ua1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const ua2 = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36";
console.log("chrome UA isBot:", BOT_RE.test(ua1));
console.log("headless UA isBot:", BOT_RE.test(ua2));
