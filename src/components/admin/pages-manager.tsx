"use client";

import { useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FilePlus2,
  Film,
  Heading1,
  ImagePlus,
  Link2,
  Loader2,
  MousePointerClick,
  Minus,
  Pencil,
  Quote,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "./upload";
import { slugify } from "@/lib/blocks";
import type { AdminBlock, AdminPageItem } from "./types";

const BLOCK_TYPES: Array<{ type: AdminBlock["type"]; label: string; icon: React.ReactNode }> = [
  { type: "heading", label: "Heading", icon: <Heading1 className="h-4 w-4" /> },
  { type: "text", label: "Text", icon: <AlignLeft className="h-4 w-4" /> },
  { type: "image", label: "Image", icon: <ImagePlus className="h-4 w-4" /> },
  { type: "video", label: "Video", icon: <Film className="h-4 w-4" /> },
  { type: "quote", label: "Quote", icon: <Quote className="h-4 w-4" /> },
  { type: "button", label: "Button", icon: <MousePointerClick className="h-4 w-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="h-4 w-4" /> },
];

function newBlock(type: AdminBlock["type"]): AdminBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "New heading", size: "md" };
    case "text":
      return { type: "text", text: "Write something…" };
    case "image":
      return { type: "image", src: "", caption: "" };
    case "video":
      return { type: "video", src: "" };
    case "quote":
      return { type: "quote", text: "Quote text…", author: "" };
    case "button":
      return { type: "button", label: "Click me", href: "https://" };
    case "divider":
      return { type: "divider" };
  }
}

export function PagesManager({
  pages,
  onRefresh,
}: {
  pages: AdminPageItem[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminPageItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createPage() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), slug: slugify(newTitle.trim()) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed");
      toast({ title: "Page created", description: `Ab /${slugify(newTitle.trim())} par live hai.` });
      setAddOpen(false);
      setNewTitle("");
      onRefresh();
    } catch (e) {
      toast({ title: "Create failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function toggle(page: AdminPageItem, key: "visible" | "showInNav") {
    setBusyId(page.id);
    try {
      await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !page[key] }),
      });
      onRefresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(page: AdminPageItem) {
    if (!window.confirm(`Delete "${page.title}" permanently?`)) return;
    setBusyId(page.id);
    try {
      await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      toast({ title: "Page deleted" });
      onRefresh();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...pages];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await fetch("/api/admin/pages/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-wonk text-2xl font-semibold text-ink">Pages</h2>
          <p className="text-xs text-olive">
            Nayi page banao — About, Services, Reviews… jo chaha. Navbar mein automatically aa jayega.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="h-9 rounded-full bg-olive px-4 text-white hover:bg-olive-dark"
        >
          <FilePlus2 className="h-4 w-4" /> New page
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-olive/20">
          <p className="font-accent text-lg italic text-olive">Abhi koi extra page nahi hai.</p>
          <p className="mt-1 text-sm text-ink/60">
            &quot;New page&quot; dabao — jaise About, Pricing, Testimonials — sab kuch khud design karo.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pages.map((page, i) => (
            <li key={page.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-olive/20">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-wonk truncate text-lg font-semibold text-ink">
                    {page.title}
                  </p>
                  <p className="truncate text-xs text-olive">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-olive">
                    {busyId === page.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : page.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    Live
                  </label>
                  <Switch checked={page.visible} onCheckedChange={() => toggle(page, "visible")} />
                  <label className="flex items-center gap-1.5 text-olive">Navbar</label>
                  <Switch checked={page.showInNav} onCheckedChange={() => toggle(page, "showInNav")} />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} className="h-8 w-8 rounded-full text-olive hover:bg-olive/10" onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === pages.length - 1} className="h-8 w-8 rounded-full text-olive hover:bg-olive/10" onClick={() => move(i, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10" onClick={() => setEditing({ ...page })}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete page" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50" onClick={() => remove(page)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-olive/80">
                {page.blocks.length} block{page.blocks.length === 1 ? "" : "s"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-wonk text-xl text-ink">New page</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-ink">Page title</Label>
              <Input
                autoFocus
                value={newTitle}
                placeholder="e.g. About Me"
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive"
                onKeyDown={(e) => e.key === "Enter" && createPage()}
              />
              {newTitle.trim() && (
                <p className="text-xs text-olive">Link banega: /{slugify(newTitle.trim())}</p>
              )}
            </div>
            <Button disabled={creating || !newTitle.trim()} onClick={createPage} className="h-10 w-full rounded-xl bg-olive hover:bg-olive-dark">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editing && (
        <PageEditor
          page={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block editor
// ---------------------------------------------------------------------------

function PageEditor({
  page,
  onClose,
  onSaved,
}: {
  page: AdminPageItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [blocks, setBlocks] = useState<AdminBlock[]>(page.blocks);
  const [busy, setBusy] = useState(false);
  const [uploadIdx, setUploadIdx] = useState<number | null>(null);

  function updateBlock(index: number, patch: Partial<AdminBlock>) {
    setBlocks((bs) => bs.map((b, i) => (i === index ? ({ ...b, ...patch } as AdminBlock) : b)));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  }

  async function uploadImage(index: number, file: File) {
    setUploadIdx(index);
    try {
      const { url } = await uploadFile(file, () => {});
      updateBlock(index, { src: url } as Partial<AdminBlock>);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadIdx(null);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, blocks }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast({ title: "Page saved", description: "Live ho gaya." });
      onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-sm">
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl rounded-3xl bg-mist shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-3xl border-b border-olive/15 bg-mist/95 px-5 py-4 backdrop-blur">
          <h3 className="font-display font-wonk truncate text-xl font-semibold text-ink">
            Edit: {title}
          </h3>
          <Button variant="ghost" size="icon" aria-label="Close editor" className="h-9 w-9 shrink-0 rounded-full text-ink hover:bg-olive/10" onClick={onClose}>
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          {/* title + slug */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-ink">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink">Link (slug)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-10 rounded-xl border-olive/30 font-mono text-sm focus-visible:ring-olive" />
              <p className="text-xs text-olive">Page khulegi: /{slug}</p>
            </div>
          </div>

          {/* blocks */}
          <div className="space-y-3">
            {blocks.map((block, i) => (
              <div key={i} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-olive/20">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-olive">
                    {BLOCK_TYPES.find((b) => b.type === block.type)?.icon}
                    {BLOCK_TYPES.find((b) => b.type === block.type)?.label}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" aria-label="Move block up" disabled={i === 0} className="h-7 w-7 rounded-full text-olive hover:bg-olive/10" onClick={() => moveBlock(i, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Move block down" disabled={i === blocks.length - 1} className="h-7 w-7 rounded-full text-olive hover:bg-olive/10" onClick={() => moveBlock(i, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete block" className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {block.type === "heading" && (
                  <div className="space-y-2">
                    <Input value={block.text} onChange={(e) => updateBlock(i, { text: e.target.value } as Partial<AdminBlock>)} className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive" />
                    <div className="flex gap-1.5">
                      {(["sm", "md", "lg"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateBlock(i, { size: s } as Partial<AdminBlock>)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            block.size === s ? "bg-olive text-white" : "bg-olive/10 text-ink hover:bg-olive/20"
                          }`}
                        >
                          {s === "sm" ? "Small" : s === "md" ? "Medium" : "Big"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "text" && (
                  <Textarea
                    value={block.text}
                    rows={4}
                    onChange={(e) => updateBlock(i, { text: e.target.value } as Partial<AdminBlock>)}
                    className="rounded-xl border-olive/30 focus-visible:ring-olive"
                  />
                )}

                {block.type === "image" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        id={`img-${i}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadImage(i, f);
                          e.target.value = "";
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={uploadIdx === i} className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10" onClick={() => document.getElementById(`img-${i}`)?.click()}>
                        {uploadIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                        Upload image
                      </Button>
                      {block.src && (
                        <span className="font-accent truncate text-xs italic text-olive">✓ image set</span>
                      )}
                    </div>
                    {block.src && (
                                       
                      <img src={block.src} alt="" className="max-h-40 rounded-xl object-cover ring-1 ring-olive/20" />
                    )}
                    <Input value={block.caption} placeholder="Caption (optional)" onChange={(e) => updateBlock(i, { caption: e.target.value } as Partial<AdminBlock>)} className="h-9 rounded-xl border-olive/30 focus-visible:ring-olive" />
                  </div>
                )}

                {block.type === "video" && (
                  <div className="space-y-2">
                    <Input
                      value={block.src}
                      placeholder="Video link (https://…mp4) ya pehle upload karo"
                      onChange={(e) => updateBlock(i, { src: e.target.value } as Partial<AdminBlock>)}
                      className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        id={`vid-${i}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadImage(i, f);
                          e.target.value = "";
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={uploadIdx === i} className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10" onClick={() => document.getElementById(`vid-${i}`)?.click()}>
                        {uploadIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
                        Upload video
                      </Button>
                      {block.src && <span className="font-accent truncate text-xs italic text-olive">{block.src}</span>}
                    </div>
                  </div>
                )}

                {block.type === "quote" && (
                  <div className="space-y-2">
                    <Textarea value={block.text} rows={2} onChange={(e) => updateBlock(i, { text: e.target.value } as Partial<AdminBlock>)} className="rounded-xl border-olive/30 focus-visible:ring-olive" />
                    <Input value={block.author} placeholder="Author (optional)" onChange={(e) => updateBlock(i, { author: e.target.value } as Partial<AdminBlock>)} className="h-9 rounded-xl border-olive/30 focus-visible:ring-olive" />
                  </div>
                )}

                {block.type === "button" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={block.label} placeholder="Button text" onChange={(e) => updateBlock(i, { label: e.target.value } as Partial<AdminBlock>)} className="h-10 rounded-xl border-olive/30 focus-visible:ring-olive" />
                    <Input value={block.href} placeholder="https://link…" onChange={(e) => updateBlock(i, { href: e.target.value } as Partial<AdminBlock>)} className="h-10 rounded-xl border-olive/30 font-mono text-sm focus-visible:ring-olive" />
                  </div>
                )}

                {block.type === "divider" && (
                  <p className="text-xs text-olive">Ek khorchi line (divider) dikhegi.</p>
                )}
              </div>
            ))}
          </div>

          {/* add block palette */}
          <div className="rounded-2xl border-2 border-dashed border-olive/30 p-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-olive">Add block</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map((b) => (
                <Button
                  key={b.type}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-olive/40 text-ink hover:bg-olive/10"
                  onClick={() => setBlocks((bs) => [...bs, newBlock(b.type)])}
                >
                  {b.icon} {b.label}
                </Button>
              ))}
            </div>
          </div>

          {/* save bar */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" className="rounded-full text-ink hover:bg-olive/10" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={save} className="h-10 rounded-full bg-olive px-6 text-white hover:bg-olive-dark">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
