"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUTE_EVENT = "jaami:mute-all";

interface VideoCardProps {
  src: string;
  aspect?: "portrait" | "video";
  className?: string;
}

export function VideoCard({ src, aspect = "portrait", className = "" }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [duration, setDuration] = useState<string | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMuteAll = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail !== src && videoRef.current) {
        videoRef.current.muted = true;
        setMuted(true);
      }
    };
    window.addEventListener(MUTE_EVENT, onMuteAll);
    return () => window.removeEventListener(MUTE_EVENT, onMuteAll);
  }, [src]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: src }));
      video.play().catch(() => {});
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration;
    if (Number.isFinite(d)) {
      setDuration(`${d.toFixed(1)}s`);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#15180f] shadow-md ring-1 ring-[#778667]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-[#778667]/60 ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        className={`w-full object-cover ${aspect === "portrait" ? "aspect-[9/16]" : "aspect-video"}`}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
      />
      {duration && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
          {duration}
        </span>
      )}
      <button
        type="button"
        aria-label={muted ? "Unmute video" : "Mute video"}
        onClick={toggleMute}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-[#778667] focus:opacity-100 group-hover:opacity-100 sm:h-10 sm:w-10"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      {!inView && (
        <div className="pointer-events-none absolute inset-0 bg-[#778667]/10 transition-opacity" />
      )}
    </div>
  );
}
