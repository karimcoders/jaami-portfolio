import { NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_EXT = new Set([
  "mp4", "webm", "mov", "m4v", "avi", "mkv", // video
  "jpg", "jpeg", "png", "webp", "gif", "avif", // image
]);

const MAX_BYTES = 300 * 1024 * 1024; // 300MB

/** Upload a video/image file to public/uploads — returns its public URL */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: `File type .${ext} not allowed (use mp4/webm/mov or jpg/png/webp)` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 300MB" }, { status: 400 });
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const read = Readable.fromWeb(file.stream() as import("stream/web").ReadableStream);
  await pipeline(read, createWriteStream(path.join(dir, name)));

  return NextResponse.json({ url: `/uploads/${name}`, size: file.size });
}
