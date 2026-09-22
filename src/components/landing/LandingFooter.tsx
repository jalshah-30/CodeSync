import React from "react";
import { BrandLogo } from "./BrandLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer id="docs" className="bg-ink border-t border-royal/30 pt-16 pb-6 px-4 sm:px-6 lg:px-12 text-cream relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          {/* Big Statement on the left */}
          <div className="md:col-span-6 space-y-4">
            <BrandLogo size="md" />
            <p className="text-xl sm:text-2xl font-display font-medium text-cream/90 leading-snug max-w-md">
              Pair programming shouldn't mean screen sharing a static view.
              CodeSync puts the editor, the voice and the run button in one room.
            </p>
            <p className="text-xs text-cream/50 pt-2">
              Designed and engineered for seamless peer-to-peer developer collaboration.
            </p>
          </div>

          {/* Two Link Columns */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cream/40">
              Product
            </p>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><a href="#features" className="hover:text-cream transition">Live Cursors</a></li>
              <li><a href="#features" className="hover:text-cream transition">Per-Line Authorship</a></li>
              <li><a href="#features" className="hover:text-cream transition">WebRTC Voice Mesh</a></li>
              <li><a href="#languages" className="hover:text-cream transition">11 Languages</a></li>
              <li><a href="#features" className="hover:text-cream transition">Shared Terminal</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-cream/40">
              Architecture
            </p>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><span className="hover:text-cream transition">Socket.IO State Sync</span></li>
              <li><span className="hover:text-cream transition">Full-Mesh WebRTC</span></li>
              <li><span className="hover:text-cream transition">Error Attribution Engine</span></li>
              <li><span className="hover:text-cream transition">Gemini 3.8 Co-Pilot</span></li>
              <li><span className="hover:text-cream transition">Isolated Code Sandbox</span></li>
            </ul>
          </div>
        </div>

        {/* GCET line and copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-royal/30 text-xs text-cream/50 gap-2 mb-8">
          <p>Built at GCET • SoftDecoders</p>
          <p>© {new Date().getFullYear()} codesync. All rights reserved.</p>
        </div>
      </div>

      {/* Very large low-contrast "codesync" wordmark cut off at the bottom */}
      <div
        aria-hidden="true"
        className="w-full select-none pointer-events-none text-center leading-none -mb-12 sm:-mb-20 md:-mb-28 text-royal/20 font-bold tracking-tighter text-[8rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] font-display"
      >
        codesync
      </div>
    </footer>
  );
};
