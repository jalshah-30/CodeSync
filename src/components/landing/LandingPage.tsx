import React, { useState } from "react";
import { LandingNav } from "./LandingNav";
import { LandingHero } from "./LandingHero";
import { LandingStatement } from "./LandingStatement";
import { LandingFeaturesSheet } from "./LandingFeaturesSheet";
import { LandingMarquee } from "./LandingMarquee";
import { LandingStartCards } from "./LandingStartCards";
import { LandingFooter } from "./LandingFooter";

interface LandingPageProps {
  onOpenLobby: (initialTab: "create" | "join") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLobby }) => {
  const [activeSection, setActiveSection] = useState("features");

  return (
    <div className="min-h-screen bg-ink text-cream font-sans antialiased overflow-x-hidden selection:bg-royal selection:text-cream">
      {/* Floating Pill Nav */}
      <LandingNav
        onOpenRoom={() => onOpenLobby("create")}
        activeSection={activeSection}
        onNavigate={(id) => {
          setActiveSection(id);
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Hero Section */}
      <LandingHero
        onOpenRoom={() => onOpenLobby("create")}
        onJoinWithCode={() => onOpenLobby("join")}
      />

      {/* Scroll-Linked Statement */}
      <LandingStatement />

      {/* Cream Sliding Features Sheet */}
      <LandingFeaturesSheet onStartRoom={() => onOpenLobby("create")} />

      {/* Supported Languages Slow Marquee */}
      <LandingMarquee />

      {/* "Start Your Way" Expandable Cards */}
      <LandingStartCards onSelectFlow={(tab) => onOpenLobby(tab)} />

      {/* Editorial Ink Footer */}
      <LandingFooter />
    </div>
  );
};
