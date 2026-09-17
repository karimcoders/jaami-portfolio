"use client";

import { useRef, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Palette,
  RotateCcw,
  Search,
  Save,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "./upload";
import type { AdminSettings } from "./types";

const COLOR_FIELDS = [
  { key: "colorOlive", label: "Primary (buttons, headings)" },
  { key: "colorOliveDark", label: "Primary dark (footer, hovers)" },
  { key: "colorSage", label: "Background (main page)" },
  { key: "colorMist", label: "Light panel background" },
  { key: "colorInk", label: "Text color" },
  { key: "colorCream", label: "Light text color" },
] as const;

const FONT_PRESETS = [
  { key: "fraunces", label: "Fraunces", desc: "Curly wonky serif + Playfair italic (current)" },
  { key: "playfair", label: "Playfair", desc: "Elegant classic serif display" },
  { key: "dmserif", label: "DM Serif", desc: "High-contrast modern serif" },
  { key: "modern", label: "Modern", desc: "Clean sans-serif (Poppins)" },
] as const;

const SECTION_TOGGLES = [
  { key: "showMarquee", label: "Scrolling marquee band" },
  { key: "showStats", label: "Hero stats badges" },
  { key: "showShort", label: "Short Form section" },
  { key: "showLong", label: "Long Form section" },
  { key: "showContact", label: "Contact section" },
] as const;

export function DesignForm({ settings }: { settings: AdminSettings }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminSettings>(settings);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(kind: "logo" | "favicon", file: File) {
    setUploading(kind);
    try {
      const { url } = await uploadFile(file, () => {});
      set(kind === "logo" ? "logoUrl" : "faviconUrl", url);
      toast({ title: kind === "logo" ? "Logo uploaded" : "Favicon uploaded", description: "Save karke live hoga." });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast({ title: "Design saved", description: "Site par turant live ho gaya." });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ---------- Logo & favicon ---------- */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive/20">
        <h3 className="font-display font-wonk flex items-center gap-2 text-lg font-semibold text-ink">
          <ImagePlus className="h-4.5 w-4.5 text-olive" /> Logo &amp; Favicon
        </h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="text-ink">Logo (navbar + footer)</Label>
            <p className="mt-1 text-xs text-olive">Empty rehne do toh naam text hi dikhega.</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-14 w-28 items-center justify-center overflow-hidden rounded-xl bg-mist ring-1 ring-olive/20">
                {form.logoUrl ? (
                   
                  <img src={form.logoUrl} alt="Logo preview" className="max-h-12 max-w-24 object-contain" />
                ) : (
                  <span className="font-display font-wonk text-lg font-semibold text-ink">{form.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload("logo", f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading === "logo"}
                  className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploading === "logo" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  Upload
                </Button>
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-olive hover:bg-olive/10"
                    onClick={() => set("logoUrl", "")}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-ink">Favicon (browser tab icon)</Label>
            <p className="mt-1 text-xs text-olive">Chhoti square image (PNG/ICO).</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-mist ring-1 ring-olive/20">
                {form.faviconUrl ? (
                   
                  <img src={form.faviconUrl} alt="Favicon preview" className="h-9 w-9 object-contain" />
                ) : (
                  <span className="text-xs text-olive">none</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload("favicon", f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading === "favicon"}
                  className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  {uploading === "favicon" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  Upload
                </Button>
                {form.faviconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-olive hover:bg-olive/10"
                    onClick={() => set("faviconUrl", "")}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Colors ---------- */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive/20">
        <h3 className="font-display font-wonk flex items-center gap-2 text-lg font-semibold text-ink">
          <Palette className="h-4.5 w-4.5 text-olive" /> Colors
        </h3>
        <p className="mt-1 text-sm text-olive">
          Rang badlo — poori site turant naye rangon mein badal jayegi.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <input
                type="color"
                aria-label={c.label}
                value={form[c.key]}
                onChange={(e) => set(c.key, e.target.value as AdminSettings[typeof c.key])}
                className="h-10 w-14 cursor-pointer rounded-lg border border-olive/30 bg-white p-1"
              />
              <div className="min-w-0 flex-1">
                <Label className="text-xs text-ink">{c.label}</Label>
                <Input
                  value={form[c.key]}
                  onChange={(e) => set(c.key, e.target.value as AdminSettings[typeof c.key])}
                  className="mt-0.5 h-9 rounded-lg border-olive/30 font-mono text-xs focus-visible:ring-olive"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Fonts ---------- */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive/20">
        <h3 className="font-display font-wonk flex items-center gap-2 text-lg font-semibold text-ink">
          <Type className="h-4.5 w-4.5 text-olive" /> Font style
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FONT_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => set("fontPreset", p.key)}
              aria-pressed={form.fontPreset === p.key}
              className={`rounded-2xl p-4 text-left transition-all ring-1 ${
                form.fontPreset === p.key
                  ? "bg-olive/10 ring-2 ring-olive"
                  : "bg-mist/60 ring-olive/20 hover:ring-olive/50"
              }`}
            >
              <span
                className="font-wonk text-2xl font-semibold text-ink"
                style={{
                  fontFamily:
                    p.key === "fraunces"
                      ? "var(--font-fraunces), Georgia, serif"
                      : p.key === "playfair"
                        ? "var(--font-playfair), Georgia, serif"
                        : p.key === "dmserif"
                          ? "var(--font-dmserif), Georgia, serif"
                          : "var(--font-poppins), sans-serif",
                  fontStyle: p.key === "playfair" ? "italic" : "normal",
                }}
              >
                Aa Bb Cc
              </span>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                {p.label}
                {form.fontPreset === p.key && <Check className="h-3.5 w-3.5 text-olive" />}
              </p>
              <p className="text-xs text-olive">{p.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Sections + SEO + footer ---------- */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive/20">
        <h3 className="font-display font-wonk flex items-center gap-2 text-lg font-semibold text-ink">
          <Eye className="h-4.5 w-4.5 text-olive" /> Sections on / off
        </h3>
        <div className="mt-4 space-y-3">
          {SECTION_TOGGLES.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-ink">{s.label}</span>
              <Switch
                checked={form[s.key]}
                onCheckedChange={(v) => set(s.key, v as AdminSettings[typeof s.key])}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive/20">
        <h3 className="font-display font-wonk flex items-center gap-2 text-lg font-semibold text-ink">
          <Search className="h-4.5 w-4.5 text-olive" /> SEO &amp; Footer
        </h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-ink">Google tab title</Label>
            <Input
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-ink">Google description</Label>
            <Textarea
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              rows={3}
              className="rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-ink">Footer text</Label>
            <Input
              value={form.footerText}
              placeholder={`© ${new Date().getFullYear()} ${form.name} Visuals. All rights reserved.`}
              onChange={(e) => set("footerText", e.target.value)}
              className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
            <p className="text-xs text-olive">Khali chhodo toh default copyright dikhega.</p>
          </div>
        </div>
      </section>

      {/* sticky save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-3.5 shadow-lg">
        <p className="text-sm text-cream/90">Changes site par turant live honge</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-cream/80 hover:bg-white/10 hover:text-cream"
            onClick={() => setForm(settings)}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={save}
            className="h-9 rounded-full bg-olive px-5 text-white hover:bg-olive-dark"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save design
          </Button>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-olive">
        <EyeOff className="h-3.5 w-3.5" /> Off kiye hue sections home page par hide ho jayenge.
      </p>
    </div>
  );
}
