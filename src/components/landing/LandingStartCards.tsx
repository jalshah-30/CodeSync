import React, { useState } from "react";
import { Plus, LogIn, ArrowRight, ShieldCheck, KeyRound, Radio, Code2 } from "lucide-react";

interface LandingStartCardsProps {
  onSelectFlow: (tab: "create" | "join") => void;
}

export const LandingStartCards: React.FC<LandingStartCardsProps> = ({ onSelectFlow }) => {
  const [hoveredCard, setHoveredCard] = useState<"create" | "join" | null>(null);

  return (
    <section id="start" className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-ink text-cream relative">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-widest text-cream/50 font-semibold font-mono mb-3">
            Instant Collaboration
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight text-cream">
            Start your way.
          </h2>
          <p className="text-sm sm:text-base text-cream/70 mt-3">
            Choose whether to spin up a fresh collaborative session or jump into an active team room.
          </p>
        </div>

        {/* Two Interactive Cards with Flex-Grow Transition */}
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Card 1: Create a room */}
          <div
            onMouseEnter={() => setHoveredCard("create")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`rounded-[20px] p-8 sm:p-10 border transition-all duration-500 ease-out flex flex-col justify-between ${
              hoveredCard === "create"
                ? "md:flex-[1.3] bg-surface border-royal shadow-2xl"
                : hoveredCard === "join"
                ? "md:flex-[0.7] bg-surface/60 border-royal/30 opacity-80"
                : "md:flex-1 bg-surface border-royal/40"
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-[12px] bg-royal/40 border border-royal flex items-center justify-center mb-6">
                <Plus className="w-6 h-6 text-cream" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-semibold mb-3">
                Create a room
              </h3>
              <p className="text-sm text-cream/75 leading-relaxed mb-8">
                Spin up a blank file or template in any of the 11 supported languages.
                Set a room password so your teammates join securely.
              </p>

              <div className="space-y-2.5 mb-8 text-xs font-mono text-cream/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#52B788]" />
                  <span>Password-protected room key</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#70A6FF]" />
                  <span>Choose starter language & template</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#E5A84B]" />
                  <span>Voice mesh enabled on entry</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectFlow("create")}
              className="w-full bg-cream text-ink font-semibold py-3.5 px-6 rounded-full hover:bg-cream/90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 text-sm"
            >
              <span>Create a room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Join with a code */}
          <div
            onMouseEnter={() => setHoveredCard("join")}
            onMouseLeave={() => setHoveredCard(null)}
            className={`rounded-[20px] p-8 sm:p-10 border transition-all duration-500 ease-out flex flex-col justify-between ${
              hoveredCard === "join"
                ? "md:flex-[1.3] bg-surface border-royal shadow-2xl"
                : hoveredCard === "create"
                ? "md:flex-[0.7] bg-surface/60 border-royal/30 opacity-80"
                : "md:flex-1 bg-surface border-royal/40"
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-[12px] bg-royal/40 border border-royal flex items-center justify-center mb-6">
                <LogIn className="w-6 h-6 text-cream" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-semibold mb-3">
                Join with a code
              </h3>
              <p className="text-sm text-cream/75 leading-relaxed mb-8">
                Got a room code from a teammate? Paste it here, enter the password,
                and your cursor lands in the editor with live audio.
              </p>

              <div className="space-y-2.5 mb-8 text-xs font-mono text-cream/70">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#E5A84B]" />
                  <span>6-character room code (e.g. ABC123)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#52B788]" />
                  <span>Secure room password verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#70A6FF]" />
                  <span>Immediate peer-to-peer sync</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectFlow("join")}
              className="w-full bg-cream text-ink font-semibold py-3.5 px-6 rounded-full hover:bg-cream/90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 text-sm"
            >
              <span>Join with a code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
