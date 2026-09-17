"use client";

import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { jsonHeaders } from "./upload";

export function PasswordForm() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast({
        title: "Passwords don't match",
        description: "Naya password aur confirm same hone chahiye.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ current, next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Change failed");
      toast({
        title: "Password changed ✓",
        description: "Next login se naya password lagega.",
      });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast({
        title: "Change failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#778667]/20 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#778667] text-[#eef3e5]">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display font-wonk text-xl font-semibold text-[#4a5442]">
            Change password
          </h2>
          <p className="text-sm text-[#4a5442]/70">
            Apne admin panel ka password secure rakhein.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw-current" className="text-[#4a5442]">Current password</Label>
          <Input
            id="pw-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="h-11 rounded-xl border-[#778667]/30 focus-visible:ring-[#778667]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-next" className="text-[#4a5442]">New password</Label>
          <Input
            id="pw-next"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="h-11 rounded-xl border-[#778667]/30 focus-visible:ring-[#778667]"
          />
          <p className="text-xs text-[#4a5442]/60">Kam se kam 6 characters.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-confirm" className="text-[#4a5442]">Confirm new password</Label>
          <Input
            id="pw-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 rounded-xl border-[#778667]/30 focus-visible:ring-[#778667]"
          />
        </div>
        <Button
          type="submit"
          disabled={busy || !current || !next || !confirm}
          className="h-11 w-full rounded-xl bg-[#778667] hover:bg-[#5f6d52]"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </section>
  );
}
