"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Film,
  Clapperboard,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  UserRound,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProfileForm } from "./profile-form";
import { VideosManager } from "./videos-manager";
import { ContactsManager } from "./contacts-manager";
import { PasswordForm } from "./password-form";
import type { AdminData } from "./types";

type Status = "loading" | "login" | "ready";

export function AdminApp() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<AdminData | null>(null);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) {
        setStatus("login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as AdminData;
      setData(json);
      setStatus("ready");
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not load content. Please refresh the page.",
        variant: "destructive",
      });
      setStatus("login");
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setStatus("login");
    setData(null);
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef3e5]">
        <div className="flex flex-col items-center gap-3 text-[#778667]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-accent text-lg italic">Loading studio…</p>
        </div>
      </div>
    );
  }

  if (status === "login") {
    return <LoginScreen onLoggedIn={() => refresh()} />;
  }

  return (
    <div className="min-h-screen bg-[#eef3e5]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#778667]/20 bg-[#eef3e5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#778667] text-[#eef3e5]">
              <LayoutDashboard className="h-4.5 w-4.5" />
            </span>
            <div className="leading-tight">
              <p className="font-display font-wonk text-xl font-semibold tracking-wide text-[#4a5442]">
                {data?.settings.name ?? "JAAMI"} Studio
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#778667]">
                Content Manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-[#778667]/40 text-[#4a5442] hover:bg-[#778667]/10"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View site</span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 rounded-full border-[#778667]/40 text-[#4a5442] hover:bg-[#778667]/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {data && (
          <Tabs defaultValue="profile">
            <TabsList className="mb-6 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-[#778667]/10 p-1.5">
              <TabsTrigger
                value="profile"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs data-[state=active]:bg-[#778667] data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <UserRound className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="short"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs data-[state=active]:bg-[#778667] data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <Clapperboard className="h-4 w-4" /> Short ({data.videos.filter((v) => v.type === "short").length})
              </TabsTrigger>
              <TabsTrigger
                value="long"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs data-[state=active]:bg-[#778667] data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <Film className="h-4 w-4" /> Long ({data.videos.filter((v) => v.type === "long").length})
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs data-[state=active]:bg-[#778667] data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <Phone className="h-4 w-4" /> Contact
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="gap-1.5 rounded-xl px-3 py-2 text-xs data-[state=active]:bg-[#778667] data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <LockKeyhole className="h-4 w-4" /> Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileForm settings={data.settings} onSaved={refresh} />
            </TabsContent>
            <TabsContent value="short">
              <VideosManager
                type="short"
                videos={data.videos.filter((v) => v.type === "short")}
                onRefresh={refresh}
              />
            </TabsContent>
            <TabsContent value="long">
              <VideosManager
                type="long"
                videos={data.videos.filter((v) => v.type === "long")}
                onRefresh={refresh}
              />
            </TabsContent>
            <TabsContent value="contact">
              <ContactsManager contacts={data.contacts} onRefresh={refresh} />
            </TabsContent>
            <TabsContent value="account">
              <PasswordForm />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Wrong password");
        return;
      }
      onLoggedIn();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef3e5] px-4">
      <div
        aria-hidden
        className="pointer-events-none fixed -left-24 top-16 h-72 w-72 rounded-full bg-[#778667]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-16 bottom-10 h-80 w-80 rounded-full bg-[#778667]/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl ring-1 ring-[#778667]/20">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#778667] text-[#eef3e5] shadow-md">
            <LockKeyhole className="h-6 w-6" />
          </span>
          <h1 className="font-display font-wonk text-3xl font-semibold tracking-tight text-[#4a5442]">
            JAAMI Studio
          </h1>
          <p className="font-accent mt-1 text-sm italic text-[#778667]">
            Portfolio content manager
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#4a5442]">
              Admin password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                className="h-11 rounded-xl border-[#778667]/30 pr-16 focus-visible:ring-[#778667]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#778667] hover:text-[#5f6d52]"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy || !password}
            className="h-11 w-full rounded-xl bg-[#778667] text-base hover:bg-[#5f6d52]"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-[#4a5442]/60">
          Yahan se aap apni website ka content khud edit kar sakte hain —
          videos, profile, contact sab kuch.
        </p>
      </div>
    </div>
  );
}
