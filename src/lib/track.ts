"use client";

// Client-side tracking helpers. Fire-and-forget — analytics must never
// break or slow down the site.

const VISITOR_KEY = "jaami_vid";
const SESSION_KEY = "jaami_sid";
const TRACK_URL = "/api/track";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/** Stable anonymous id persisted in localStorage. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + uuid();
  }
}

/** Per-browser-session id (new tab = new session). */
export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "ses-" + uuid();
  }
}

export function currentPath(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

/** POST helper that falls back to sendBeacon on page-hide. */
function send(payload: Record<string, unknown>, useBeacon = false): void {
  const body = JSON.stringify(payload);
  try {
    if (useBeacon && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(TRACK_URL, blob)) return;
    }
    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Record a custom event (video play, contact click, CTA click…). */
export function trackEvent(name: string, label = ""): void {
  send({
    type: "event",
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    name,
    label,
    path: currentPath(),
  });
}
