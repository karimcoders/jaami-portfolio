"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { jsonHeaders, uploadFile } from "./upload";
import type { AdminSettings } from "./types";

export function ProfileForm({
  settings,
  onSaved,
}: {
  settings: AdminSettings;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [about, setAbout] = useState(settings.about);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl);
  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl);
  const [stats, setStats] = useState<string[]>(settings.stats);
  const [shortSubtitle, setShortSubtitle] = useState(settings.shortSubtitle);
  const [longSubtitle, setLongSubtitle] = useState(settings.longSubtitle);
  const [contactIntro, setContactIntro] = useState(settings.contactIntro);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleAvatar(file: File) {
    setUploading(true);
    try {
      const { url } = await uploadFile(file, () => {});
      setAvatarUrl(url);
      toast({ title: "Photo uploaded", description: "Save karna na bhoolein!" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({
          name,
          tagline,
          about,
          avatarUrl,
          whatsappUrl,
          stats,
          shortSubtitle,
          longSubtitle,
          contactIntro,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      toast({ title: "Saved ✓", description: "Website par live ho gaya hai." });
      onSaved();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-olive/20 sm:p-6">
        <h2 className="font-display font-wonk mb-1 text-xl font-semibold text-ink sm:text-2xl">
          Hero &amp; Profile
        </h2>
        <p className="mb-5 text-sm text-ink/70">
          Website ke top section mein naam, tagline aur photo.
        </p>

        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <div className="h-28 w-28 overflow-hidden rounded-3xl bg-olive/15 ring-2 ring-olive/40">
              {avatarUrl ? (
                 
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-olive">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatar(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mt-2 w-full rounded-xl border-olive/40 text-ink hover:bg-olive/10"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Change photo
            </Button>
          </div>

          <div className="w-full space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pf-name" className="text-ink">Name</Label>
                <Input
                  id="pf-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-tagline" className="text-ink">Tagline</Label>
                <Input
                  id="pf-tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-about" className="text-ink">About text</Label>
              <Textarea
                id="pf-about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
                className="rounded-xl border-olive/30 focus-visible:ring-olive"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-wa" className="text-ink">
                WhatsApp / Hire Me link
              </Label>
              <Input
                id="pf-wa"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://wa.me/91..."
                className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
              />
            </div>
          </div>
        </div>

        {/* Stats chips */}
        <div className="space-y-2">
          <Label className="text-ink">Highlight badges (hero chips)</Label>
          <div className="space-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={stat}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = e.target.value;
                    setStats(next);
                  }}
                  className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove badge"
                  onClick={() => setStats(stats.filter((_, j) => j !== i))}
                  className="h-11 w-11 shrink-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStats([...stats, ""])}
            className="rounded-xl border-olive/40 text-ink hover:bg-olive/10"
          >
            <Plus className="h-4 w-4" /> Add badge
          </Button>
        </div>
      </section>

      {/* Sections copy */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-olive/20 sm:p-6">
        <h2 className="font-display font-wonk mb-1 text-xl font-semibold text-ink sm:text-2xl">
          Section text
        </h2>
        <p className="mb-5 text-sm text-ink/70">
          Videos aur contact sections ke chhote captions.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pf-short" className="text-ink">
              Short form section caption
            </Label>
            <Input
              id="pf-short"
              value={shortSubtitle}
              onChange={(e) => setShortSubtitle(e.target.value)}
              className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-long" className="text-ink">
              Long form section caption
            </Label>
            <Input
              id="pf-long"
              value={longSubtitle}
              onChange={(e) => setLongSubtitle(e.target.value)}
              className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-intro" className="text-ink">
              Contact section intro
            </Label>
            <Textarea
              id="pf-intro"
              value={contactIntro}
              onChange={(e) => setContactIntro(e.target.value)}
              rows={3}
              className="rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>
        </div>
      </section>

      {/* Sticky save */}
      <div className="sticky bottom-4 z-30">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-ink p-3 pl-5 shadow-lg">
          <p className="hidden text-sm text-mist/80 sm:block">
            Changes website par tabhi dikhengi jab aap save karenge.
          </p>
          <Button
            type="button"
            onClick={save}
            disabled={busy || uploading}
            className="ml-auto h-11 flex-1 rounded-xl bg-[#a3b68d] px-8 text-base font-medium text-[#2c3325] hover:bg-[#b7c7a3] sm:flex-none"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
