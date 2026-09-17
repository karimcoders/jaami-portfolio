"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  currentPath,
  getSessionId,
  getVisitorId,
} from "@/lib/track";

const HEARTBEAT_INTERVAL_MS = 15_000;
const DEDUPE_MS = 5_000;

/** Skip re-recording the same path within DEDUPE_MS (React StrictMode
 *  double-mounts effects in dev, which used to create duplicate views). */
function isDuplicateView(path: string): boolean {
  try {
    const raw = sessionStorage.getItem("jaami_last_view");
    if (raw) {
      const { path: p, ts } = JSON.parse(raw) as { path: string; ts: number };
      if (p === path && Date.now() - ts < DEDUPE_MS) return true;
    }
    sessionStorage.setItem(
      "jaami_last_view",
      JSON.stringify({ path, ts: Date.now() })
    );
  } catch {
    /* private mode etc. — never block tracking */
  }
  return false;
}

/**
 * Mounts once in the root layout. Records a page view on every route
 * change and keeps a "visible seconds" heartbeat so the admin can see
 * how long visitors actually engage. Admin paths are never tracked.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const viewIdRef = useRef<string | null>(null);
  const visibleSecRef = useRef(0);

  const isTracked = pathname ? !pathname.startsWith("/admin") : false;

  useEffect(() => {
    if (!isTracked || !pathname) return;

    let cancelled = false;

    // -- Record page view ------------------------------------------------
    const record = async () => {
      if (isDuplicateView(pathname)) return;
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "view",
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          path: pathname,
          referrer: document.referrer ?? "",
          screen:
            typeof window !== "undefined"
              ? `${window.innerWidth}x${window.innerHeight}`
              : "",
          language: navigator.language ?? "",
        }),
        keepalive: true,
      }).catch(() => null);

      if (cancelled) return;
      if (res && res.ok) {
        const json = (await res.json().catch(() => null)) as { id?: string } | null;
        viewIdRef.current = json?.id ?? null;
        visibleSecRef.current = 0;
      }
    };
    record();

    // -- Visible-time accumulation (1s ticks) ------------------------------
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") {
        visibleSecRef.current += 1;
      }
    }, 1000);

    // -- Heartbeat ---------------------------------------------------------
    const beat = () => {
      const id = viewIdRef.current;
      if (!id || visibleSecRef.current <= 0) return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "heartbeat",
          id,
          visibleSec: visibleSecRef.current,
        }),
        keepalive: true,
      }).catch(() => {});
    };
    const heartbeat = setInterval(beat, HEARTBEAT_INTERVAL_MS);

    // -- Final beat when the tab hides / page unloads -----------------------
    const onHide = () => {
      if (document.visibilityState === "hidden") beat();
    };
    const beatWithBeacon = () => {
      const id = viewIdRef.current;
      if (!id || visibleSecRef.current <= 0) return;
      const body = JSON.stringify({
        type: "heartbeat",
        id,
        visibleSec: visibleSecRef.current,
      });
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" });
          if (navigator.sendBeacon("/api/track", blob)) return;
        }
      } catch {
        /* fall through to fetch */
      }
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", beatWithBeacon);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", beatWithBeacon);
      // Route change within SPA: send one last beat for the old view
      beatWithBeacon();
    };
  }, [pathname, isTracked]);

  return null;
}
