"use client";

import { trackEvent } from "@/lib/track";
import type { Block } from "@/lib/blocks";

/**
 * WordPress-style block renderer — renders the editable blocks of a Page
 * in the site's editorial design language.
 */
export function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const size =
              block.size === "lg"
                ? "text-[clamp(2rem,5.5vw,3.75rem)]"
                : block.size === "sm"
                  ? "text-xl sm:text-2xl"
                  : "text-2xl sm:text-4xl";
            return (
              <h2
                key={i}
                className={`font-display font-wonk mt-10 mb-4 font-semibold leading-tight tracking-tight text-ink first:mt-0 ${size}`}
              >
                {block.text}
              </h2>
            );
          }
          case "text":
            return (
              <div key={i} className="mb-5 space-y-4">
                {block.text.split(/\n{2,}/).map((para, j) => (
                  <p key={j} className="text-base leading-relaxed text-ink/90 sm:text-lg">
                    {para}
                  </p>
                ))}
              </div>
            );
          case "image":
            return (
              <figure key={i} className="mb-8">
                { }
                <img
                  src={block.src}
                  alt={block.caption || ""}
                  className="w-full rounded-2xl object-cover shadow-md ring-1 ring-olive/25"
                />
                {block.caption && (
                  <figcaption className="font-accent mt-2.5 text-center text-sm italic text-olive">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "video":
            return (
              <video
                key={i}
                src={block.src}
                controls
                playsInline
                preload="metadata"
                className="mb-8 aspect-video w-full rounded-2xl bg-coal object-contain shadow-md ring-1 ring-olive/25"
              />
            );
          case "quote":
            return (
              <blockquote key={i} className="mb-8 border-l-4 border-olive pl-5">
                <p className="font-accent text-xl italic leading-relaxed text-ink sm:text-2xl">
                  &ldquo;{block.text}&rdquo;
                </p>
                {block.author && (
                  <cite className="mt-2 block text-sm not-italic text-olive">
                    — {block.author}
                  </cite>
                )}
              </blockquote>
            );
          case "button":
            return (
              <a
                key={i}
                href={block.href}
                target={block.href.startsWith("http") ? "_blank" : undefined}
                rel={block.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={() => trackEvent("cta_click", `page-btn:${block.label}`)}
                className="mb-8 inline-flex items-center gap-2 rounded-full bg-olive px-7 py-3 text-sm font-medium text-cream shadow-md transition-all hover:-translate-y-0.5 hover:bg-olive-dark hover:shadow-lg"
              >
                {block.label}
              </a>
            );
          case "divider":
            return <hr key={i} className="my-10 border-olive/25" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
