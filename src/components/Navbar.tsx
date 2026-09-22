import React, { useState } from "react";
import {
  Copy,
  Check,
  Plus,
  LogIn,
  Mic,
  MicOff,
  Palette,
  Type,
  ShieldCheck,
  LogOut,
  Play,
  Bot,
} from "lucide-react";
import { SupportedLanguage, EditorTheme, Collaborator } from "../types";
import { SUPPORTED_LANGUAGES, EDITOR_THEMES, FONT_SIZES } from "../utils/constants";
import { BrandLogo } from "./landing/BrandLogo";

interface NavbarProps {
  roomName: string;
  roomId: string;
  hasPassword?: boolean;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  theme: EditorTheme;
  onThemeChange: (theme: EditorTheme) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  collaborators: Collaborator[];
  isMuted: boolean;
  onToggleMic: () => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  onOpenAiAssistant: () => void;
  onLeaveRoom?: () => void;
  onRunCode?: () => void;
  isRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomName,
  roomId,
  hasPassword,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  collaborators,
  isMuted,
  onToggleMic,
  onOpenCreateModal,
  onOpenJoinModal,
  onOpenAiAssistant,
  onLeaveRoom,
  onRunCode,
  isRunning = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-royal/40 bg-ink px-4 flex items-center justify-between text-xs sm:text-sm select-none z-30">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand */}
        <BrandLogo size="sm" />

        <div className="h-4 w-px bg-royal/40 hidden sm:block" />

        {/* Room Name & ID */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-cream truncate max-w-[160px]">
              {roomName || "Main Workspace"}
            </span>
            {hasPassword && (
              <div className="flex items-center gap-1 text-[11px] text-cream/50">
                <ShieldCheck className="w-3 h-3 text-cream/70" />
                <span>Protected</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyRoomId}
            title="Click to copy Room Code"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface hover:bg-royal/30 border border-royal/40 text-xs font-mono text-cream/90 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#52B788]" />
                <span className="text-[#52B788] font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cream/50" />
                <span>{roomId}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Middle: Editor Selectors */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Language */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-surface hover:border-royal border border-royal/40 rounded-[12px] px-2.5 py-1.5 text-xs text-cream font-medium cursor-pointer outline-none focus:ring-1 focus:ring-cream/40 transition"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-ink text-cream">
              {lang.name}
            </option>
          ))}
        </select>

        {/* Theme */}
        <div className="relative flex items-center">
          <Palette className="w-3.5 h-3.5 absolute left-2.5 text-cream/50 pointer-events-none" />
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as EditorTheme)}
            className="bg-surface hover:border-royal border border-royal/40 rounded-[12px] pl-7 pr-2.5 py-1.5 text-xs text-cream font-medium cursor-pointer outline-none focus:ring-1 focus:ring-cream/40 transition"
          >
            {EDITOR_THEMES.map((th) => (
              <option key={th.id} value={th.id} className="bg-ink text-cream">
                {th.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="relative flex items-center">
          <Type className="w-3.5 h-3.5 absolute left-2 text-cream/50 pointer-events-none" />
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="bg-surface hover:border-royal border border-royal/40 rounded-[12px] pl-6 pr-2 py-1.5 text-xs text-cream font-medium cursor-pointer outline-none focus:ring-1 focus:ring-cream/40 transition"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size} className="bg-ink text-cream">
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Run Button, Collaborator Avatars & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Run Button (Cream pill with ink text) */}
        {onRunCode && (
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="bg-cream text-ink font-semibold rounded-full px-4 py-1.5 hover:bg-cream/90 active:scale-95 transition text-xs flex items-center gap-1.5 shadow-none disabled:opacity-50"
            title="Execute Code (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
        )}

        {/* AI Assistant */}
        <button
          onClick={onOpenAiAssistant}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-royal/30 border border-royal/40 text-cream font-medium text-xs transition active:scale-95"
          title="Open AI Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-cream/80" />
          <span>Assistant</span>
        </button>

        {/* Voice Toggle */}
        <button
          onClick={onToggleMic}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition ${
            isMuted
              ? "bg-surface hover:bg-royal/30 border-royal/40 text-cream/60"
              : "bg-surface border-[#52B788]/60 text-[#52B788]"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-cream/40" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-[#52B788]" />
          )}
          <span className="hidden md:inline">{isMuted ? "Muted" : "Voice on"}</span>
        </button>

        {/* Collaborator Avatars (Initials in solid colored circles) */}
        <div className="flex items-center -space-x-1.5 pl-1">
          {collaborators.slice(0, 4).map((collab) => (
            <div
              key={collab.id}
              title={collab.name}
              style={{ backgroundColor: collab.color }}
              className="w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm select-none"
            >
              {collab.name.charAt(0)}
            </div>
          ))}
          {collaborators.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-surface border-2 border-ink flex items-center justify-center text-[10px] font-semibold text-cream/70">
              +{collaborators.length - 4}
            </div>
          )}
        </div>

        {/* Room Navigation / Modals */}
        <div className="flex items-center gap-1 pl-1 border-l border-royal/30">
          <button
            onClick={onOpenJoinModal}
            title="Join another room"
            className="p-1.5 rounded-[12px] bg-surface hover:bg-royal/40 text-cream/80 border border-royal/40 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenCreateModal}
            title="Create another room"
            className="p-1.5 rounded-[12px] bg-surface hover:bg-royal/40 text-cream/80 border border-royal/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              title="Leave Room & Return to Overview"
              className="p-1.5 rounded-[12px] bg-surface hover:bg-rose-500/20 hover:text-rose-300 border border-royal/40 text-cream/60 text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
