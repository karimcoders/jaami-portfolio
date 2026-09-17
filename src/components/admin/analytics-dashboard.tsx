"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Eye,
  Globe2,
  History,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Totals {
  views: number;
  visitors: number;
  viewsToday: number;
  avgDuration: number;
  liveVisitors: number;
  totalEvents: number;
  allTimeViews: number;
  allTimeVisitors: number;
}
interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
}
interface NamedCount {
  name: string;
  views: number;
}
interface CountryRow {
  country: string;
  countryCode: string;
  views: number;
  visitors: number;
}
interface CityRow {
  city: string;
  country: string;
  views: number;
}
interface EventRow {
  name: string;
  label: string;
  count: number;
}
interface RecentRow {
  path: string;
  referrerHost: string;
  country: string;
  countryCode: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  durationSec: number;
  createdAt: string;
}
interface LiveRow {
  id: string;
  path: string;
  country: string;
  countryCode: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  createdAt: string;
}
interface AnalyticsData {
  totals: Totals;
  daily: DailyPoint[];
  topPages: NamedCount[];
  topSources: NamedCount[];
  countries: CountryRow[];
  cities: CityRow[];
  devices: NamedCount[];
  browsers: NamedCount[];
  os: NamedCount[];
  topEvents: EventRow[];
  recent: RecentRow[];
  live: LiveRow[];
}

const RANGES = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All time" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flag(cc: string): string {
  if (!cc || cc.length !== 2 || !/^[a-z]{2}$/i.test(cc)) return "🌐";
  return String.fromCodePoint(
    ...cc
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0))
  );
}

function fmtDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const EVENT_LABELS: Record<string, string> = {
  video_play: "Video played",
  contact_click: "Contact clicked",
  cta_click: "Button clicked",
};

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#778667]/20 sm:p-5",
        accent && "ring-2 ring-[#778667]"
      )}
    >
      <div className="flex items-center gap-2 text-[#778667]">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="font-display font-wonk mt-2 text-3xl font-semibold text-[#4a5442] sm:text-4xl">
        {value}
      </p>
      {sub && <p className="font-accent mt-1 text-xs italic text-[#778667]">{sub}</p>}
    </div>
  );
}

function BarList({
  title,
  rows,
  emptyText,
  renderName,
}: {
  title: string;
  rows: NamedCount[];
  emptyText: string;
  renderName?: (name: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#778667]/20 sm:p-5">
      <h3 className="font-display font-wonk text-lg font-semibold text-[#4a5442]">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#4a5442]/50">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-[#4a5442]">
                  {renderName ? renderName(row.name) : row.name}
                </span>
                <span className="font-accent shrink-0 italic text-[#778667]">
                  {row.views}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#778667]/10">
                <div
                  className="h-full rounded-full bg-[#778667]/70"
                  style={{ width: `${(row.views / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#778667]/20 sm:p-5",
        className
      )}
    >
      <h3 className="font-display font-wonk text-lg font-semibold text-[#4a5442]">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function AnalyticsDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (currentRange: string, showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?range=${currentRange}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed");
        setData((await res.json()) as AnalyticsData);
        setError(null);
      } catch {
        setError("Analytics load nahi hui. Refresh karke try karo.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(range);
  }, [range, load]);

  // auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => load(range, false), 30_000);
    return () => clearInterval(t);
  }, [range, load]);

  const totals = data?.totals;

  return (
    <div className="space-y-5">
      {/* Header row: title + range selector + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#778667] text-[#eef3e5]">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display font-wonk text-2xl font-semibold text-[#4a5442]">
              Visitor Analytics
            </h2>
            <p className="text-xs text-[#778667]">
              Kaun aa raha hai, kahan se, kya kar raha hai — sab yahan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-[#778667]/10 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-[#778667] text-white shadow-sm"
                    : "text-[#4a5442] hover:text-[#778667]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh analytics"
            className="h-9 w-9 shrink-0 rounded-full border-[#778667]/40 text-[#4a5442] hover:bg-[#778667]/10"
            onClick={() => load(range)}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {loading && !data ? (
        <div className="flex min-h-64 items-center justify-center text-[#778667]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="font-accent italic">Loading analytics…</p>
          </div>
        </div>
      ) : data && totals ? (
        <>
          {/* ---- Stat cards ---- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              accent={totals.liveVisitors > 0}
              icon={
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75",
                      totals.liveVisitors > 0
                        ? "animate-ping bg-green-500"
                        : "bg-[#778667]"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-2.5 w-2.5 rounded-full",
                      totals.liveVisitors > 0 ? "bg-green-500" : "bg-[#778667]"
                    )}
                  />
                </span>
              }
              label="Live now"
              value={totals.liveVisitors}
              sub="last 5 min me active"
            />
            <StatCard
              icon={<Eye className="h-3.5 w-3.5" />}
              label="Views"
              value={totals.views}
              sub={`${totals.viewsToday} aaj (IST)`}
            />
            <StatCard
              icon={<Users className="h-3.5 w-3.5" />}
              label="Unique visitors"
              value={totals.visitors}
              sub={`${totals.allTimeVisitors} all-time`}
            />
            <StatCard
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Avg. time on page"
              value={fmtDuration(totals.avgDuration)}
              sub={`${totals.totalEvents} interactions`}
            />
          </div>

          {/* ---- Daily chart ---- */}
          <Card title="Daily views & visitors">
            <div className="mt-4 h-56 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#778667" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#778667" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a5442" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4a5442" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#77866722" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={dayLabel}
                    tick={{ fontSize: 11, fill: "#778667" }}
                    tickLine={false}
                    axisLine={{ stroke: "#77866733" }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#778667" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #77866744",
                      fontSize: 12,
                    }}
                    labelFormatter={(l) => dayLabel(String(l))}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#778667"
                    strokeWidth={2}
                    fill="url(#gViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="#4a5442"
                    strokeWidth={1.5}
                    fill="url(#gVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* ---- Live visitors ---- */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Live visitors
              </span>
            }
          >
            {data.live.length === 0 ? (
              <p className="mt-3 text-sm text-[#4a5442]/50">
                Abhi koi active nahi hai. Jab koi site kholega, yahan real-time
                dikhega.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#778667]/10">
                {data.live.map((v) => (
                  <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <span className="font-medium text-[#4a5442]">
                      {v.city || v.country}
                      {v.countryCode ? ` ${flag(v.countryCode)}` : ""}
                    </span>
                    <span className="text-[#778667]">· {v.device} · {v.browser}</span>
                    <span className="text-[#4a5442]/60">· {v.path}</span>
                    <span className="font-accent ml-auto italic text-[#778667]">
                      {timeAgo(v.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ---- Breakdowns ---- */}
          <div className="grid gap-4 md:grid-cols-2">
            <BarList
              title="Top pages"
              rows={data.topPages}
              emptyText="Abhi tak koi view nahi."
            />
            <BarList
              title="Kahan se aaye (sources)"
              rows={data.topSources}
              emptyText="Abhi tak koi source nahi."
            />
            <BarList
              title="Cities"
              rows={data.cities.map((c) => ({ name: `${c.city}, ${c.country}`, views: c.views }))}
              emptyText="Location data abhi available nahi."
            />
            <BarList
              title="Devices"
              rows={data.devices}
              emptyText="Abhi tak koi device data nahi."
            />
            <BarList
              title="Browsers"
              rows={data.browsers}
              emptyText="Abhi tak koi browser data nahi."
            />
            <BarList
              title="Operating systems"
              rows={data.os}
              emptyText="Abhi tak koi OS data nahi."
            />
          </div>

          {/* ---- Countries + Events ---- */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Countries">
              {data.countries.length === 0 ? (
                <p className="mt-3 text-sm text-[#4a5442]/50">
                  Country data abhi available nahi.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {data.countries.map((c) => {
                    const max = Math.max(1, ...data.countries.map((x) => x.views));
                    return (
                      <li key={c.country}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate text-[#4a5442]">
                            {flag(c.countryCode)} {c.country}
                            <span className="font-accent ml-2 text-xs italic text-[#778667]">
                              {c.visitors} visitor{c.visitors === 1 ? "" : "s"}
                            </span>
                          </span>
                          <span className="font-accent shrink-0 italic text-[#778667]">
                            {c.views}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#778667]/10">
                          <div
                            className="h-full rounded-full bg-[#778667]/70"
                            style={{ width: `${(c.views / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card title="What visitors did (events)">
              {data.topEvents.length === 0 ? (
                <p className="mt-3 text-sm text-[#4a5442]/50">
                  Abhi tak koi interaction nahi — jab koi video play ya button
                  click karega, yahan dikhega.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[#778667]/10">
                  {data.topEvents.map((e, i) => (
                    <li key={`${e.name}-${e.label}-${i}`} className="flex items-center gap-3 py-2.5 text-sm">
                      <MousePointerClick className="h-4 w-4 shrink-0 text-[#778667]" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#4a5442]">
                          {EVENT_LABELS[e.name] ?? e.name}
                        </p>
                        {e.label && (
                          <p className="truncate text-xs text-[#778667]">{e.label}</p>
                        )}
                      </div>
                      <span className="font-accent shrink-0 rounded-full bg-[#778667]/10 px-2.5 py-0.5 text-xs italic text-[#5f6d52]">
                        ×{e.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* ---- Recent visitors feed ---- */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#778667]" />
                Recent visitors
              </span>
            }
          >
            {data.recent.length === 0 ? (
              <p className="mt-3 text-sm text-[#4a5442]/50">
                Abhi tak koi visit nahi hui.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#778667]/15 text-[11px] uppercase tracking-wider text-[#778667]">
                      <th className="py-2 pr-3 font-semibold">When</th>
                      <th className="py-2 pr-3 font-semibold">Location</th>
                      <th className="py-2 pr-3 font-semibold">Device</th>
                      <th className="py-2 pr-3 font-semibold">Source</th>
                      <th className="py-2 pr-3 font-semibold">Page</th>
                      <th className="py-2 font-semibold">Time spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#778667]/8">
                    {data.recent.map((v, i) => (
                      <tr key={`${v.createdAt}-${i}`} className="text-[#4a5442]">
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          {timeAgo(v.createdAt)}
                        </td>
                        <td className="py-2.5 pr-3">
                          {v.city || v.country}
                          {v.countryCode ? ` ${flag(v.countryCode)}` : ""}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-[#778667]">
                          {v.device === "Mobile" ? "📱" : v.device === "Tablet" ? "📟" : "💻"}{" "}
                          {v.browser}
                        </td>
                        <td className="py-2.5 pr-3">
                          <Globe2 className="mr-1 inline h-3.5 w-3.5 text-[#778667]" />
                          {v.referrerHost}
                        </td>
                        <td className="py-2.5 pr-3 font-medium">{v.path}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          {fmtDuration(v.durationSec)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <p className="text-center text-xs text-[#4a5442]/50">
            Data har 30 second me auto-refresh hota hai · Times IST ke hisaab se
          </p>
        </>
      ) : null}
    </div>
  );
}
