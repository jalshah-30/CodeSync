import React from "react";
import { SUPPORTED_LANGUAGES } from "../../utils/constants";

export const LandingMarquee: React.FC = () => {
  // Duplicate for seamless infinite loop
  const marqueeItems = [...SUPPORTED_LANGUAGES, ...SUPPORTED_LANGUAGES];

  return (
    <section id="languages" className="py-14 bg-ink border-y border-royal/30 overflow-hidden relative select-none">
      <div className="max-w-6xl mx-auto px-4 mb-5 text-center">
        <p className="text-xs uppercase tracking-widest text-cream/50 font-semibold font-mono">
          Run and debug across 11 native environments
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 items-center gap-4 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]">
          {marqueeItems.map((lang, idx) => (
            <div
              key={`${lang.id}-${idx}`}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-surface border border-royal/40 text-cream shrink-0 hover:border-royal transition-colors"
            >
              <span className="font-medium text-sm sm:text-base tracking-tight">
                {lang.name}
              </span>
              <span className="text-xs font-mono text-cream/50 px-2 py-0.5 rounded-full bg-royal/30">
                {lang.extension}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
