"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { jsonHeaders } from "./upload";
import { CONTACT_TYPE_OPTIONS, type AdminContact } from "./types";

function TypeIcon({ type }: { type: string }) {
  if (type === "instagram") {
    return <span className="text-lg">📸</span>;
  }
  if (type === "whatsapp") {
    return <span className="text-lg">💬</span>;
  }
  if (type === "email") {
    return <span className="text-lg">✉️</span>;
  }
  return <Phone className="h-5 w-5" />;
}

export function ContactsManager({
  contacts,
  onRefresh,
}: {
  contacts: AdminContact[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminContact | null>(null);
  const [deleting, setDeleting] = useState<AdminContact | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleVisible(contact: AdminContact) {
    setBusyId(contact.id);
    try {
      await fetch(`/api/admin/contacts/${contact.id}`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ visible: !contact.visible }),
      });
      onRefresh();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= contacts.length) return;
    const next = [...contacts];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await fetch("/api/admin/contacts/reorder", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      onRefresh();
    } catch {
      toast({ title: "Reorder failed", variant: "destructive" });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await fetch(`/api/admin/contacts/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      onRefresh();
      toast({ title: "Contact deleted" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-wonk text-xl font-semibold text-[#4a5442] sm:text-2xl">
            Contact channels
          </h2>
          <p className="text-sm text-[#4a5442]/70">
            Website ke contact section mein kya dikhe — yahan se control karein.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="h-11 rounded-xl bg-[#778667] px-5 hover:bg-[#5f6d52]"
        >
          <Plus className="h-4 w-4" /> Add contact
        </Button>
      </div>

      <ul className="space-y-3">
        {contacts.map((contact, i) => (
          <li
            key={contact.id}
            className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#778667]/20 transition-opacity ${
              contact.visible ? "" : "opacity-60"
            } ${busyId === contact.id ? "pointer-events-none" : ""}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#778667]/15 text-[#5f6d52]">
              <TypeIcon type={contact.type} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#4a5442]">{contact.label}</p>
              <p className="truncate text-xs text-[#4a5442]/50">{contact.href}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="h-7 w-7 rounded-lg text-[#4a5442] hover:bg-[#778667]/15"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={i === contacts.length - 1}
                  onClick={() => move(i, 1)}
                  className="h-7 w-7 rounded-lg text-[#4a5442] hover:bg-[#778667]/15"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Switch
                checked={contact.visible}
                onCheckedChange={() => toggleVisible(contact)}
                aria-label="Toggle visibility"
                className="data-[state=checked]:bg-[#778667]"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit contact"
                onClick={() => setEditing(contact)}
                className="h-9 w-9 rounded-lg text-[#4a5442] hover:bg-[#778667]/15"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete contact"
                onClick={() => setDeleting(contact)}
                className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ContactDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        contact={null}
        onSaved={onRefresh}
      />
      <ContactDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        contact={editing}
        onSaved={onRefresh}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this contact?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Website ke contact section se hat jayega.
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

function ContactDialog({
  open,
  onOpenChange,
  contact,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact: AdminContact | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!contact;

  const [type, setType] = useState("instagram");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (open && !isEdit && loadedId !== "__add__") {
    setLoadedId("__add__");
    setType("instagram");
    setLabel("");
    setHref("");
  }
  if (open && isEdit && contact && loadedId !== contact.id) {
    setLoadedId(contact.id);
    setType(contact.type);
    setLabel(contact.label);
    setHref(contact.href);
  }

  async function save() {
    if (!label.trim() || !href.trim()) {
      toast({
        title: "Dono fields bhar'ein",
        description: "Label aur link required hain.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/contacts/${contact!.id}` : "/api/admin/contacts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ type, label, href }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      toast({ title: isEdit ? "Saved ✓" : "Contact added ✓" });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit contact" : "Add contact"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[#4a5442]">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-11 rounded-xl border-[#778667]/30 focus:ring-[#778667]">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-label" className="text-[#4a5442]">
              Display text
            </Label>
            <Input
              id="c-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. @jaami.visuals"
              className="h-11 rounded-xl border-[#778667]/30 focus-visible:ring-[#778667]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-href" className="text-[#4a5442]">
              Link {type === "email" ? "(email address)" : "(URL)"}
            </Label>
            <Input
              id="c-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder={type === "email" ? "hello@example.com" : "https://..."}
              className="h-11 rounded-xl border-[#778667]/30 focus-visible:ring-[#778667]"
            />
          </div>

          <Button
            onClick={save}
            disabled={busy}
            className="h-11 w-full rounded-xl bg-[#778667] hover:bg-[#5f6d52]"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
