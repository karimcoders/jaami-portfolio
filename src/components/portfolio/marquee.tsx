const WORDS = [
  "REELS",
  "SHORTS",
  "LONG FORM",
  "STORYTELLING",
  "TRANSITIONS",
  "SOUND DESIGN",
];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-[#5f6d52] bg-[#778667] py-5 sm:py-7"
    >
      <div className="flex w-max animate-marquee items-center gap-10 pr-10">
        {row.map((word, i) => (
          <span key={i} className="flex items-center gap-10">
            <span
              className={`font-display font-wonk whitespace-nowrap text-[clamp(1.75rem,4vw,3.25rem)] leading-none ${
                i % 2 === 0
                  ? "italic text-[#eef3e5]"
                  : "text-outline-cream"
              }`}
            >
              {word}
            </span>
            <span className="text-xl text-[#d9e6ca] sm:text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
