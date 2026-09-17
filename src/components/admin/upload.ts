"use client";

/** Upload a file to /api/admin/upload with progress reporting */
export function uploadFile(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json.error || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

/** Read the duration of a local video file (seconds, formatted m:ss) */
export function detectDuration(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const d = video.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(d)) {
        const m = Math.floor(d / 60);
        const s = Math.round(d % 60);
        resolve(`${m}:${s.toString().padStart(2, "0")}`);
      } else {
        resolve(null);
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

export const jsonHeaders = { "Content-Type": "application/json" };
