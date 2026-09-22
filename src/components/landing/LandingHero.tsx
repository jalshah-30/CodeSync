import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Terminal, Mic, Radio, Check, Bot } from "lucide-react";

interface LandingHeroProps {
  onOpenRoom: () => void;
  onJoinWithCode: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenRoom,
  onJoinWithCode,
}) => {
  const prefersReduced = useReducedMotion();

  // Floating drift animation configs
  const driftVariant = (duration: number, yDistance: number, delay: number) => ({
    animate: prefersReduced
      ? {}
      : {
          y: [-yDistance, yDistance, -yDistance],
          transition: {
            duration,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
          },
        },
  });

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 overflow-hidden bg-ink text-cream">
      {/* Centered Hero Copy */}
      <div className="max-w-4xl mx-auto text-center mb-14 md:mb-20">
        <h1 className="headline-display mb-6 text-cream">
          Code together. Same file, same second.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-cream/75 max-w-2xl mx-auto leading-relaxed mb-8">
          A shared editor with live cursors, voice and an assistant that reads along.
          Open a room, send the code, start typing.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
          <button
            onClick={onOpenRoom}
            className="bg-cream text-ink font-semibold px-6 py-3 rounded-full hover:bg-cream/90 transition-all active:scale-95 text-sm sm:text-base shadow-lg"
          >
            Open a room
          </button>
          <button
            onClick={onJoinWithCode}
            className="text-cream/80 hover:text-cream underline underline-offset-8 transition-colors font-medium text-sm sm:text-base"
          >
            Join with a code
          </button>
        </div>
      </div>

      {/* Floating Staggered Rounded-Square Tiles */}
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden py-8">
        <div className="flex items-center justify-center gap-4 sm:gap-6 min-w-full">
          {/* Tile 1: Real Cursor with Name Tag (HTML/CSS Crop) */}
          <motion.div
            variants={driftVariant(6.5, 9, 0)}
            animate="animate"
            className="w-44 h-44 sm:w-52 sm:h-52 bg-surface border border-royal/40 rounded-[20px] p-4 flex flex-col justify-between shadow-lg shrink-0"
          >
            <div className="flex items-center justify-between text-xs text-cream/60">
              <span className="font-mono">workspace.py</span>
              <span className="text-[11px] text-cream/40">L12</span>
            </div>
            <div className="relative font-mono text-xs text-cream/90 space-y-1">
              <p className="text-cream/50">def solve(arr):</p>
              <div className="flex items-center">
                <span className="text-cream pl-3">evens = [x</span>
                {/* Live blinking cursor */}
                <span className="w-0.5 h-4 bg-[#70A6FF] inline-block ml-0.5 animate-pulse" />
              </div>
              {/* Floating name badge */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#70A6FF] text-ink font-sans font-bold text-[10px] shadow">
                <span>Jal Shah</span>
              </div>
            </div>
            <div className="text-[11px] text-cream/50">Edited 2s ago</div>
          </motion.div>

          {/* Tile 2: Solid Royal with Language Name */}
          <motion.div
            variants={driftVariant(7.8, 12, 0.4)}
            animate="animate"
            className="hidden sm:flex w-36 h-36 sm:w-44 sm:h-44 bg-royal text-cream rounded-[20px] p-5 flex-col justify-between shadow-lg shrink-0"
          >
            <span className="text-xs text-cream/60 font-mono">01</span>
            <div>
              <p className="text-xl font-bold font-mono">Python 3</p>
              <p className="text-xs text-cream/70 mt-0.5 font-mono">.py</p>
            </div>
          </motion.div>

          {/* Tile 3: Real Terminal Result (with Cream L-shaped bracket accent) */}
          <motion.div
            variants={driftVariant(6.0, 8, 0.8)}
            animate="animate"
            className="relative w-52 h-52 sm:w-60 sm:h-60 bg-surface border border-royal/40 rounded-[20px] p-4 flex flex-col justify-between shadow-xl shrink-0"
          >
            {/* L-shaped corner bracket accent in cream */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cream pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-cream/70 pt-1 pl-1">
              <div className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-cream/70" />
                <span>terminal</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
                Exit 0
              </span>
            </div>

            <div className="bg-ink/80 rounded-[12px] p-2.5 font-mono text-[11px] space-y-1 text-cream/80 border border-royal/30">
              <p className="text-cream/50">$ python main.py</p>
              <p className="text-cream font-medium">Filtered & Sorted:</p>
              <p className="text-cream/90">[24, 16, 12, 8]</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-cream/50 font-mono">
              <span>stdout</span>
              <span>0.04s</span>
            </div>
          </motion.div>

          {/* Tile 4: Solid Cream with Ink Text */}
          <motion.div
            variants={driftVariant(8.2, 11, 0.2)}
            animate="animate"
            className="hidden md:flex w-36 h-36 sm:w-44 sm:h-44 bg-cream text-ink rounded-[20px] p-5 flex-col justify-between shadow-lg shrink-0"
          >
            <span className="text-xs text-ink/60 font-mono">02</span>
            <div>
              <p className="text-xl font-bold font-mono">Rust</p>
              <p className="text-xs text-ink/70 mt-0.5 font-mono">.rs</p>
            </div>
          </motion.div>

          {/* Tile 5: Voice Room Chip (HTML/CSS Crop) */}
          <motion.div
            variants={driftVariant(7.2, 10, 0.6)}
            animate="animate"
            className="w-48 h-48 sm:w-56 sm:h-56 bg-surface border border-royal/40 rounded-[20px] p-4 flex flex-col justify-between shadow-lg shrink-0"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-cream/80 font-medium">
                <Radio className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Voice Mesh</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#52B788]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-ink/70 p-2 rounded-[12px] border border-royal/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#70A6FF]" />
                  <span className="text-xs font-medium text-cream">Alex</span>
                </div>
                {/* Audio wave bars */}
                <div className="flex items-end gap-0.5 h-4 px-1">
                  <span className="w-1 bg-[#52B788] rounded-full audio-bar-1" />
                  <span className="w-1 bg-[#52B788] rounded-full audio-bar-2" />
                  <span className="w-1 bg-[#52B788] rounded-full audio-bar-3" />
                  <span className="w-1 bg-[#52B788] rounded-full audio-bar-4" />
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-1 text-xs text-cream/60">
                <span>Maya (Muted)</span>
                <Mic className="w-3 h-3 text-cream/40" />
              </div>
            </div>

            <div className="text-[11px] text-cream/50">WebRTC peer mesh</div>
          </motion.div>

          {/* Tile 6: Solid Surface with Royal Border */}
          <motion.div
            variants={driftVariant(7.5, 9, 1.0)}
            animate="animate"
            className="hidden lg:flex w-36 h-36 sm:w-44 sm:h-44 bg-surface border border-royal rounded-[20px] p-5 flex-col justify-between shadow-lg shrink-0"
          >
            <span className="text-xs text-cream/60 font-mono">03</span>
            <div>
              <p className="text-xl font-bold font-mono">TypeScript</p>
              <p className="text-xs text-cream/70 mt-0.5 font-mono">.ts</p>
            </div>
          </motion.div>

          {/* Tile 7: Assistant Reply (HTML/CSS Crop) */}
          <motion.div
            variants={driftVariant(6.8, 10, 0.5)}
            animate="animate"
            className="hidden lg:flex w-52 h-52 sm:w-56 sm:h-56 bg-surface border border-royal/40 rounded-[20px] p-4 flex-col justify-between shadow-lg shrink-0"
          >
            <div className="flex items-center gap-1.5 text-xs text-cream/70">
              <Bot className="w-3.5 h-3.5 text-cream/70" />
              <span className="font-semibold">CodeSync AI</span>
            </div>

            <div className="bg-ink/70 p-2.5 rounded-[12px] border border-royal/30 text-xs leading-relaxed text-cream/90">
              <p className="text-[11px] text-cream/60 mb-1">Single-pass review:</p>
              <p className="text-xs font-mono text-cream">
                O(N) filter completed. No heap allocations needed.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-cream/50">
              <span>Ready to apply</span>
              <span className="text-cream font-medium">1-click patch</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
