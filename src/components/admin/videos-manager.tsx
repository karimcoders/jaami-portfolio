"use client";

import { useEffect, useRef, useState } from "react";
import {
  Reorder,
  useDragControls,
} from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Eye,
  EyeOff,
  GripVertical,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { detectDuration, jsonHeaders, uploadFile } from "./upload";
import type { AdminVideo } from "./types";

const TYPE_LABEL = { short: "Short form", long: "Long form" } as const;

export function VideosManager({
  type,
  videos,
  onRefresh,
}: {
  type: "short" | "long";
  videos: AdminVideo[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVideo | null>(null);
  const [deleting, setDeleting] = useState<AdminVideo | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Local order for drag & drop; synced from the server list on refresh.
  const [order, setOrder] = useState<AdminVideo[]>(videos);
  useEffect(() => setOrder(videos), [videos]);

  // Auto-save whenever local order diverges from the server list.
  useEffect(() => {
    const propIds = videos.map((v) => v.id).join(",");
    const localIds = order.map((v) => v.id).join(",");
    if (propIds === localIds) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/videos/reorder", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ ids: order.map((v) => v.id) }),
        });
        if (!res.ok) throw new Error("failed");
        onRefresh();
      } catch {
        toast({ title: "Reorder failed", variant: "destructive" });
        setOrder(videos); // revert to server order
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [order, videos, onRefresh, toast]);

  async function toggleVisible(video: AdminVideo) {
    setBusyId(video.id);
    try {
      await fetch(`/api/admin/videos/${video.id}`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ visible: !video.visible }),
      });
      onRefresh();
    } finally {
      setBusyId(null);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await fetch(`/api/admin/videos/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      onRefresh();
      toast({ title: "Video deleted" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-wonk text-xl font-semibold text-ink sm:text-2xl">
            {TYPE_LABEL[type]} videos
          </h2>
          <p className="text-sm text-ink/70">
            {videos.length} video{videos.length === 1 ? "" : "s"} — order, visibility aur
            content yahan manage karein.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="h-11 rounded-xl bg-olive px-5 hover:bg-olive-dark"
        >
          <Plus className="h-4 w-4" /> Add video
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-olive/20">
          <Clapperboard className="mx-auto mb-3 h-10 w-10 text-olive/50" />
          <p className="font-accent text-lg italic text-ink/70">
            Abhi koi video nahi hai — pehli video add karein!
          </p>
        </div>
      ) : (
        <>
          <p className="flex items-center gap-1.5 text-xs text-ink/60">
            <GripVertical className="h-3.5 w-3.5" />
            Video ko <b>drag karke</b> upar-neeche karein — ya arrows dabayein. #1 sabse
            pehle dikhega.
          </p>
          <Reorder.Group
            axis="y"
            values={order}
            onReorder={setOrder}
            className="space-y-3"
            as="ul"
          >
            {order.map((video, i) => (
              <VideoRow
                key={video.id}
                video={video}
                index={i}
                total={order.length}
                type={type}
                busyId={busyId}
                onToggleVisible={toggleVisible}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onEdit={() => setEditing(video)}
                onDelete={() => setDeleting(video)}
              />
            ))}
          </Reorder.Group>
        </>
      )}

      <AddVideoDialog type={type} open={addOpen} onOpenChange={setAddOpen} onAdded={onRefresh} />

      <EditVideoDialog video={editing} onClose={() => setEditing(null)} onSaved={onRefresh} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this video?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Website se permanently hat jayega. Yeh action wapas nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------- Video row (draggable) ---------------- */

function VideoRow({
  video,
  index,
  total,
  type,
  busyId,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  video: AdminVideo;
  index: number;
  total: number;
  type: "short" | "long";
  busyId: string | null;
  onToggleVisible: (v: AdminVideo) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={video}
      dragListener={false}
      dragControls={dragControls}
      as="li"
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 28px rgba(74,84,66,0.25)", zIndex: 30 }}
      className={`flex items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-olive/20 transition-opacity sm:gap-3 ${
        video.visible ? "" : "opacity-60"
      } ${busyId === video.id ? "pointer-events-none" : ""}`}
    >
      {/* drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(e) => dragControls.start(e)}
        className="touch-none shrink-0 cursor-grab rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-olive/10 hover:text-olive-dark active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* preview */}
      <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-coal sm:h-20 sm:w-14">
        <video
          src={video.src}
          muted
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover ${type === "long" ? "hidden" : ""}`}
        />
        {type === "long" && (
          <div className="flex h-full items-center justify-center text-olive">
            <Clapperboard className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-olive px-1 text-[11px] font-bold text-white">
            #{index + 1}
          </span>
          {video.title || `Video ${index + 1}`}
        </p>
        <p className="truncate text-xs text-ink/50">{video.src}</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-olive/10 px-2 py-0.5 text-[11px] font-medium text-olive-dark">
          {video.visible ? (
            <>
              <Eye className="h-3 w-3" /> Live
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" /> Hidden
            </>
          )}
        </span>
      </div>

      {/* controls */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Move up"
            disabled={index === 0}
            onClick={onMoveUp}
            className="h-8 w-8 rounded-lg text-ink hover:bg-olive/15"
          >
            <ChevronUp className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="h-8 w-8 rounded-lg text-ink hover:bg-olive/15"
          >
            <ChevronDown className="h-4.5 w-4.5" />
          </Button>
        </div>
        <Switch
          checked={video.visible}
          onCheckedChange={() => onToggleVisible(video)}
          aria-label="Toggle visibility"
          className="data-[state=checked]:bg-olive"
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit video"
          onClick={onEdit}
          className="h-9 w-9 rounded-lg text-ink hover:bg-olive/15"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete video"
          onClick={onDelete}
          className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

/* ---------------- Add dialog ---------------- */

function AddVideoDialog({
  type,
  open,
  onOpenChange,
  onAdded,
}: {
  type: "short" | "long";
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  function reset() {
    setTitle("");
    setSrc("");
    setLinkInput("");
    setDuration(null);
    setProgress(null);
    setMode("upload");
  }

  async function handleFile(file: File) {
    setProgress(0);
    setDuration(null);
    try {
      const [result, dur] = await Promise.all([
        uploadFile(file, setProgress),
        detectDuration(file),
      ]);
      setSrc(result.url);
      setDuration(dur);
      toast({ title: "Upload complete ✓", description: "Ab Save dabayein." });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setProgress(null);
    }
  }

  async function save() {
    const finalSrc = mode === "upload" ? src : linkInput.trim();
    if (!finalSrc) {
      toast({
        title: "Video chunein",
        description: mode === "upload" ? "Pehle file upload karein." : "Link paste karein.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ type, src: finalSrc, title }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      toast({ title: "Video added ✓", description: "Website par live ho gaya." });
      reset();
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add {TYPE_LABEL[type]} video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-title" className="text-ink">
              Title (optional, sirf aapke liye)
            </Label>
            <Input
              id="add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fashion reel — Sept"
              className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>

          {/* mode switch */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-olive/10 p-1">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "upload" ? "bg-olive text-white" : "text-ink"
              }`}
            >
              <UploadCloud className="h-4 w-4" /> Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "link" ? "bg-olive text-white" : "text-ink"
              }`}
            >
              <Link2 className="h-4 w-4" /> Paste link
            </button>
          </div>

          {mode === "upload" ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-olive/40 bg-olive/5 text-olive-dark transition-colors hover:bg-olive/10"
              >
                {progress !== null ? (
                  <>
                    <Loader2 className="h-7 w-7 animate-spin" />
                    <p className="text-sm font-medium">Uploading… {progress}%</p>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-olive/20">
                      <div
                        className="h-full rounded-full bg-olive transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : src ? (
                  <>
                    <video
                      src={src}
                      muted
                      playsInline
                      preload="metadata"
                      className="max-h-24 rounded-lg"
                    />
                    <p className="text-sm font-medium text-olive-dark">
                      Ready{duration ? ` • ${duration}` : ""} — tap to replace
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-7 w-7" />
                    <p className="text-sm font-medium">Tap to choose video</p>
                    <p className="text-xs text-ink/60">MP4 / MOV / WebM — max 300MB</p>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="add-link" className="text-ink">
                Video URL (direct .mp4 link)
              </Label>
              <Input
                id="add-link"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
              />
              <p className="text-xs text-ink/60">
                Google Drive/Dropbox links nahi chalenge — direct video file link chahiye.
              </p>
            </div>
          )}

          <Button
            onClick={save}
            disabled={progress !== null}
            className="h-11 w-full rounded-xl bg-olive hover:bg-olive-dark"
          >
            Add video
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Edit dialog ---------------- */

function EditVideoDialog({
  video,
  onClose,
  onSaved,
}: {
  video: AdminVideo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [newSrc, setNewSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Sync state when a different video is opened
  if (video && video.id !== loadedId) {
    setLoadedId(video.id);
    setTitle(video.title);
    setNewSrc(null);
    setProgress(null);
  }

  async function handleFile(file: File) {
    setProgress(0);
    try {
      const { url } = await uploadFile(file, setProgress);
      setNewSrc(url);
      toast({ title: "New video uploaded ✓", description: "Save dabayein." });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setProgress(null);
    }
  }

  async function save() {
    if (!video) return;
    setBusy(true);
    try {
      const body: Record<string, unknown> = { title };
      if (newSrc) body.src = newSrc;
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      toast({ title: "Saved ✓" });
      onClose();
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
    <Dialog open={!!video} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-ink">
              Title (optional)
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl border-olive/30 focus-visible:ring-olive"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-ink">Replace video file</Label>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-olive/40 bg-olive/5 text-olive-dark transition-colors hover:bg-olive/10"
            >
              {progress !== null ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm font-medium">Uploading… {progress}%</p>
                </>
              ) : newSrc ? (
                <>
                  <video
                    src={newSrc}
                    muted
                    playsInline
                    preload="metadata"
                    className="max-h-20 rounded-lg"
                  />
                  <p className="text-sm font-medium">New video ready — tap to replace</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6" />
                  <p className="text-sm font-medium">
                    Tap to replace (optional — skip to keep current)
                  </p>
                </>
              )}
            </button>
          </div>

          <Button
            onClick={save}
            disabled={busy || progress !== null}
            className="h-11 w-full rounded-xl bg-olive hover:bg-olive-dark"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
