import React, { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Menu, X, Users, Edit3, Activity, Terminal, Sparkles, Mic } from "lucide-react";

interface LandingNavProps {
  onOpenRoom: () => void;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  onOpenRoom,
  activeSection = "features",
  onNavigate,
}) => {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "features", label: "Features" },
    { id: "languages", label: "Languages" },
    { id: "start", label: "Start" },
    { id: "docs", label: "Docs" },
  ];

  const handleLinkClick = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
    setFeaturesOpen(false);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto relative w-full max-w-5xl bg-ink/90 border border-royal/40 rounded-full px-4 py-2.5 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <div className="flex items-center pl-1">
          <BrandLogo size="md" />
        </div>

        {/* Center Pill Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-surface/80 border border-royal/30 rounded-full p-1 text-xs">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            const isFeatures = link.id === "features";

            return (
              <div
                key={link.id}
                className="relative"
                onMouseEnter={() => isFeatures && setFeaturesOpen(true)}
                onMouseLeave={() => isFeatures && setFeaturesOpen(false)}
              >
                <button
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${
                    isActive
                      ? "bg-royal text-cream"
                      : "text-cream/80 hover:text-cream hover:bg-royal/30"
                  }`}
                >
                  {link.label}
                </button>

                {/* Features Cream Mega-Card */}
                {isFeatures && featuresOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-80 pointer-events-auto"
                    onMouseEnter={() => setFeaturesOpen(true)}
                    onMouseLeave={() => setFeaturesOpen(false)}
                  >
                    <div className="bg-cream text-ink border border-royal/30 rounded-[20px] p-4 shadow-xl text-left">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Column 1: Collaborate */}
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-royal mb-2 border-b border-royal/20 pb-1">
                            Collaborate
                          </p>
                          <ul className="space-y-1.5 text-xs">
                            <li className="font-medium hover:text-royal cursor-pointer">Live cursors</li>
                            <li className="font-medium hover:text-royal cursor-pointer">Line authorship</li>
                            <li className="font-medium hover:text-royal cursor-pointer">Activity log</li>
                          </ul>
                        </div>

                        {/* Column 2: Build */}
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-royal mb-2 border-b border-royal/20 pb-1">
                            Build
                          </p>
                          <ul className="space-y-1.5 text-xs">
                            <li className="font-medium hover:text-royal cursor-pointer">Run code</li>
                            <li className="font-medium hover:text-royal cursor-pointer">AI assistant</li>
                            <li className="font-medium hover:text-royal cursor-pointer">Voice room</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-1">
          <button
            onClick={onOpenRoom}
            className="hidden sm:inline-block bg-cream text-ink hover:bg-cream/90 font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full transition-colors active:scale-95 whitespace-nowrap"
          >
            Open a room
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-cream hover:bg-surface rounded-full transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-16 left-4 right-4 bg-surface border border-royal/40 rounded-[20px] p-4 shadow-2xl text-cream md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className="text-left px-3 py-2 rounded-xl hover:bg-royal/30 text-sm font-medium text-cream"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-royal/30">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRoom();
                }}
                className="w-full bg-cream text-ink font-semibold py-2 rounded-full text-sm"
              >
                Open a room
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
