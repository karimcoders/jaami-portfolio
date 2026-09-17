import { z } from "zod";

// ---------------------------------------------------------------------------
// WordPress-style page blocks — shared by admin editor and public renderer
// ---------------------------------------------------------------------------

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1).max(200),
    size: z.enum(["sm", "md", "lg"]).default("md"),
  }),
  z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(10000),
  }),
  z.object({
    type: z.literal("image"),
    src: z.string().min(1).max(500),
    caption: z.string().max(300).default(""),
  }),
  z.object({
    type: z.literal("video"),
    src: z.string().min(1).max(500),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().min(1).max(1000),
    author: z.string().max(120).default(""),
  }),
  z.object({
    type: z.literal("button"),
    label: z.string().min(1).max(80),
    href: z.string().min(1).max(500),
  }),
  z.object({
    type: z.literal("divider"),
  }),
]);

export type Block = z.infer<typeof blockSchema>;

export const blocksArraySchema = z.array(blockSchema).max(100);

export function parseBlocks(raw: string | null | undefined): Block[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    const result = blocksArraySchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

/** Slugs that can never be claimed by an editable page */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "assets",
  "uploads",
  "favicon.ico",
  "robots.txt",
  "_next",
]);

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,60}[a-z0-9]$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "page";
}
