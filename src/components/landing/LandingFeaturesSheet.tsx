import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Mic,
  MicOff,
  Radio,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  ArrowRight,
  Code2,
} from "lucide-react";

interface LandingFeaturesSheetProps {
  onStartRoom: () => void;
}

export const LandingFeaturesSheet: React.FC<LandingFeaturesSheetProps> = ({ onStartRoom }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  const tabs = [
    {
      id: "authorship",
      label: "See who wrote what",
      tag: "Live attribution",
      cardBg: "bg-royal text-cream",
      pillBg: "bg-cream/20 text-cream",
      buttonBg: "bg-cream text-ink hover:bg-cream/90",
      title: "Line-by-line attribution across the entire room",
      description:
        "Every stroke tracks who typed it. Hovering a line reveals the author, and runtime errors attribute directly to the author who changed the line.",
      actionLabel: "Open collaborative room",
    },
    {
      id: "voice",
      label: "Talk without leaving",
      tag: "Peer WebRTC audio",
      cardBg: "bg-ink text-cream",
      pillBg: "bg-royal/60 text-cream",
      buttonBg: "bg-cream text-ink hover:bg-cream/90",
      title: "An integrated voice mesh that stays in your editor",
      description:
        "No call invites, no tab switching. Join the room and your microphone mesh syncs in real time with dynamic speaking waveforms.",
      actionLabel: "Start room with voice",
    },
    {
      id: "assistant",
      label: "An assistant that reads along",
      tag: "Gemini 3.8 AI",
      cardBg: "bg-surface text-cream",
      pillBg: "bg-royal/40 text-cream",
      buttonBg: "bg-cream text-ink hover:bg-cream/90",
      title: "Explain, debug and review without losing your place",
      description:
        "CodeSync AI reads your team's live buffers, diagnoses stack traces, and proposes atomic 1-click patches directly onto the shared file.",
      actionLabel: "Test AI assistant",
    },
    {
      id: "runner",
      label: "Run it right there",
      tag: "Multi-language sandbox",
      cardBg: "bg-[#14234B] text-cream border border-royal/40",
      pillBg: "bg-cream/20 text-cream",
      buttonBg: "bg-cream text-ink hover:bg-cream/90",
      title: "Shared stdin and instant stdout for everyone",
      description:
        "Press run once and the execution output streams into everyone's terminal simultaneously with exit status and execution duration.",
      actionLabel: "Run shared code",
    },
  ];

  // Auto-advancing tab timer (~6 seconds)
  useEffect(() => {
    if (manualOverride) return;

    const interval = 50; // 50ms tick
    const totalDuration = 6000; // 6s
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      if (isHovered) return; // Pause on hover

      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((cur) => (cur + 1) % tabs.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, manualOverride, tabs.length]);

  const handleSelectTab = (index: number) => {
    setActiveTab(index);
    setProgress(0);
    setManualOverride(true); // Stop auto-advance once user manually selects a tab
  };

  const current = tabs[activeTab];

  return (
    <section
      id="features"
      className="bg-cream text-ink rounded-t-[40px] pt-14 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-12 relative shadow-2xl -mt-8 md:-mt-12 z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto">
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-ink/15">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight text-ink">
              Why teams pick CodeSync
            </h2>
          </div>
          <p className="text-sm sm:text-base italic text-ink/70 max-w-sm">
            Everything your pairing session needs in one tab, built to stay out of your way.
          </p>
        </div>

        {/* 4 Text Tabs with Underline Progress Bar */}
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-3 mb-10 border-b border-ink/10">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === idx;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(idx)}
                className="relative pb-3 text-left shrink-0 transition-colors group cursor-pointer"
              >
                <span
                  className={`text-sm sm:text-base font-semibold tracking-tight ${
                    isActive ? "text-ink" : "text-ink/60 group-hover:text-ink"
                  }`}
                >
                  {tab.label}
                </span>

                {/* Progress Underline */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-ink/10 rounded-full overflow-hidden">
                  {isActive && (
                    <div
                      className="h-full bg-royal transition-all duration-75 ease-linear"
                      style={{ width: `${manualOverride ? 100 : progress}%` }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Two-Column Tab Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Colored Card */}
          <div
            className={`lg:col-span-5 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between shadow-lg ${current.cardBg}`}
          >
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 ${current.pillBg}`}
              >
                {current.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-semibold leading-snug mb-4">
                {current.title}
              </h3>
              <p className="text-sm sm:text-base opacity-85 leading-relaxed">
                {current.description}
              </p>
            </div>

            <div className="pt-8 mt-6 border-t border-white/10">
              <button
                onClick={onStartRoom}
                className={`w-full py-3 px-5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow ${current.buttonBg}`}
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Light Panel with Interactive HTML/CSS Mini-Illustrations */}
          <div className="lg:col-span-7 bg-[#F4E9C1]/80 border border-ink/10 rounded-[20px] p-4 sm:p-7 flex flex-col justify-center min-h-[380px]">
            {/* Illustration 1: See who wrote what */}
            {activeTab === 0 && (
              <div className="bg-ink text-cream rounded-[16px] border border-royal/40 p-4 font-mono text-xs shadow-inner space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-royal/30 text-[11px] text-cream/60">
                  <span>workspace.py — Live Authorship</span>
                  <span className="text-[#70A6FF]">2 collaborators</span>
                </div>

                <div className="space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-cream/40 text-right select-none">01</span>
                    <span className="text-cream/60">def calculate_metrics(data):</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-[#70A6FF]/20 text-[#70A6FF]">
                      Jal Shah
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-6 text-cream/40 text-right select-none">02</span>
                    <span className="text-cream">  total = sum(data)</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-[#70A6FF]/20 text-[#70A6FF]">
                      Jal Shah
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-royal/30 -mx-2 px-2 py-0.5 rounded">
                    <span className="w-6 text-cream/40 text-right select-none">03</span>
                    <div className="flex items-center">
                      <span className="text-cream">  ratio = total / len(data)</span>
                      <span className="w-0.5 h-3.5 bg-[#52B788] ml-1 inline-block" />
                    </div>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-[#52B788]/20 text-[#52B788]">
                      Maya
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-6 text-cream/40 text-right select-none">04</span>
                    <span className="text-cream">  return round(ratio, 2)</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-[#52B788]/20 text-[#52B788]">
                      Maya
                    </span>
                  </div>
                </div>

                {/* Error attribution notification card */}
                <div className="mt-3 p-2.5 rounded-[12px] bg-surface border border-royal/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-cream/90">
                      Line 3 zero division caught ⬩ edited by{" "}
                      <strong className="text-[#52B788]">Maya</strong>
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-royal text-cream">
                    Traced
                  </span>
                </div>
              </div>
            )}

            {/* Illustration 2: Talk without leaving */}
            {activeTab === 1 && (
              <div className="bg-ink text-cream rounded-[16px] border border-royal/40 p-5 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#52B788]" />
                    <span className="font-semibold text-sm">Room Audio Mesh</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#52B788]/15 text-[#52B788] border border-[#52B788]/30">
                    Connected • 18ms latency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* User 1: Speaking */}
                  <div className="bg-surface border border-royal/40 p-3.5 rounded-[12px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#70A6FF]" />
                      <div>
                        <p className="text-xs font-semibold text-cream">Jal Shah</p>
                        <p className="text-[11px] text-[#52B788]">Speaking now</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-0.5 h-4 px-1">
                      <span className="w-1 bg-[#52B788] rounded-full audio-bar-1" />
                      <span className="w-1 bg-[#52B788] rounded-full audio-bar-2" />
                      <span className="w-1 bg-[#52B788] rounded-full audio-bar-3" />
                      <span className="w-1 bg-[#52B788] rounded-full audio-bar-4" />
                    </div>
                  </div>

                  {/* User 2: Muted */}
                  <div className="bg-surface border border-royal/40 p-3.5 rounded-[12px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#52B788]" />
                      <div>
                        <p className="text-xs font-semibold text-cream">Maya Lin</p>
                        <p className="text-[11px] text-cream/50">Listening</p>
                      </div>
                    </div>
                    <MicOff className="w-4 h-4 text-cream/40" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-royal/20 text-xs text-cream/60 font-mono">
                  <span>P2P Audio Mesh</span>
                  <span>Opus 48kHz Stereo</span>
                </div>
              </div>
            )}

            {/* Illustration 3: An assistant that reads along */}
            {activeTab === 2 && (
              <div className="bg-ink text-cream rounded-[16px] border border-royal/40 p-5 shadow-inner space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-royal/30">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cream" />
                    <span className="font-semibold text-xs text-cream">CodeSync AI Co-Pilot</span>
                  </div>
                  <div className="flex gap-1 text-[11px] font-medium text-cream/60">
                    <span className="px-2 py-0.5 rounded bg-royal text-cream">Explain</span>
                    <span className="px-2 py-0.5 rounded hover:text-cream">Debug</span>
                    <span className="px-2 py-0.5 rounded hover:text-cream">Review</span>
                  </div>
                </div>

                <div className="bg-surface p-3 rounded-[12px] border border-royal/40 text-xs leading-relaxed space-y-1">
                  <p className="font-semibold text-cream">Diagnosis on line 18:</p>
                  <p className="text-cream/80 text-[11px] font-mono">
                    "The recursive call lacks a base case for empty arrays. Replace with guarded slice."
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-cream/60 font-mono text-[11px]">Ready to patch</span>
                  <button className="px-3 py-1 rounded-full bg-cream text-ink text-xs font-semibold hover:bg-cream/90 transition">
                    Apply patch to editor
                  </button>
                </div>
              </div>
            )}

            {/* Illustration 4: Run it right there */}
            {activeTab === 3 && (
              <div className="bg-ink text-cream rounded-[16px] border border-royal/40 p-4 font-mono text-xs shadow-inner space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-royal/30">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cream/70" />
                    <span>stdout</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] border border-emerald-500/30">
                    Exit 0 ⬩ 0.02s
                  </span>
                </div>

                <div className="bg-surface/70 p-2.5 rounded-[12px] border border-royal/30 text-[11px] space-y-1">
                  <p className="text-cream/50">$ python3 solution.py &lt; input.txt</p>
                  <p className="text-cream font-medium">=== Active Test Results ===</p>
                  <p className="text-emerald-400">✓ Test 1: Sorted ascending [2, 4, 6, 8]</p>
                  <p className="text-emerald-400">✓ Test 2: Handled edge case [0]</p>
                  <p className="text-cream/90">Memory usage: 14.2 MB</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-cream/50 pt-1">
                  <span>stdin piped to sandbox</span>
                  <span>Instant sync</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
