import React, { useState } from "react";
import {
  Code2,
  Users,
  Copy,
  Check,
  Palette,
  Type,
  LogOut,
  Video,
  Trophy,
  Play,
} from "lucide-react";
import { SupportedLanguage, EditorTheme, Collaborator } from "../types";
import { SUPPORTED_LANGUAGES, EDITOR_THEMES, FONT_SIZES } from "../utils/constants";

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
  onOpenAiAssistant?: () => void;
  onLeaveRoom?: () => void;
  onOpenProgress?: () => void;
  showVideoChat?: boolean;
  onToggleVideoChat?: () => void;
  onOpenDebugSuite?: () => void;
  onRunCode?: () => void;
  isRunning?: boolean;
  userRole?: "teacher" | "student";
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
  onOpenProgress,
  showVideoChat,
  onToggleVideoChat,
  onOpenDebugSuite,
  onRunCode,
  isRunning,
  userRole = "student",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedCollabs = collaborators.slice(0, 4);
  const overflowCount = collaborators.length > 4 ? collaborators.length - 4 : 0;

  return (
    <header className="h-16 border-b border-[#1E2021] bg-[#000000]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between text-sm select-none z-30 text-[#FFFFFF]">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#202224] border border-[#1E2021] flex items-center justify-center">
            <Code2 className="w-5 h-5 text-[#0DCC5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#FFFFFF]">
                Code<span className="text-[#7F867F]">Sync</span>
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] border border-[#1E2021]">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-[#7F867F] leading-none hidden sm:block font-medium">
              Collaborative STEM Code Editor
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-[#1E2021] hidden md:block" />

        {/* Room Copy Pill */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleCopyRoomId}
            title="Click to copy Room Code"
            className="btn-secondary flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0DCC5C] font-bold" />
                <span className="text-[#FFFFFF] font-sans font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#7F867F]" />
                <span className="font-semibold text-[#FFFFFF]">{roomId}</span>
              </>
            )}
          </button>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {onRunCode && (
            <button
              onClick={onRunCode}
              disabled={isRunning}
              className="btn-accent flex items-center gap-2 px-4 py-1.5 text-xs active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#03110A]" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
          )}

          {onToggleVideoChat && (
            <button
              onClick={onToggleVideoChat}
              title={showVideoChat ? "Hide Video Classroom" : "Open Video Classroom"}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                showVideoChat
                  ? "bg-[#0D6430] border border-[#0DCC5C]/40 text-[#0DCC5C]"
                  : "btn-secondary text-[#7F867F]"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#0DCC5C]" />
              <span className="hidden md:inline font-medium text-[#FFFFFF]">
                {showVideoChat ? "Video On" : "Video Off"}
              </span>
            </button>
          )}

          {onOpenProgress && (
            <button
              onClick={onOpenProgress}
              title="View Learning Progress & Milestones"
              className="btn-secondary flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#7F867F] hover:text-[#FFFFFF]"
            >
              <Trophy className="w-3.5 h-3.5 text-[#7F867F]" />
              <span className="hidden lg:inline font-medium">My Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle: Editor Selectors */}
      <div className="hidden xl:flex items-center gap-2.5">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-[#202224] hover:bg-[#292C2D] border border-[#1E2021] rounded-full px-3.5 py-1.5 text-xs text-[#FFFFFF] font-semibold cursor-pointer focus:outline-none focus:border-[#0DCC5C] transition"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-[#17191A] text-[#FFFFFF]">
              {lang.name}
            </option>
          ))}
        </select>

        <div className="relative flex items-center">
          <Palette className="w-3.5 h-3.5 absolute left-3 text-[#7F867F] pointer-events-none" />
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as EditorTheme)}
            className="bg-[#202224] hover:bg-[#292C2D] border border-[#1E2021] rounded-full pl-8 pr-3.5 py-1.5 text-xs text-[#FFFFFF] font-semibold cursor-pointer focus:outline-none focus:border-[#0DCC5C] transition"
          >
            {EDITOR_THEMES.map((th) => (
              <option key={th.id} value={th.id} className="bg-[#17191A] text-[#FFFFFF]">
                {th.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex items-center">
          <Type className="w-3.5 h-3.5 absolute left-3 text-[#7F867F] pointer-events-none" />
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="bg-[#202224] hover:bg-[#292C2D] border border-[#1E2021] rounded-full pl-8 pr-3.5 py-1.5 text-xs text-[#FFFFFF] font-semibold cursor-pointer focus:outline-none focus:border-[#0DCC5C] transition"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size} className="bg-[#17191A] text-[#FFFFFF]">
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Avatar Stack & Lobby Exit */}
      <div className="flex items-center gap-3">
        {/* Collaborators Overlapping Avatar Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {displayedCollabs.map((collab) => (
              <div
                key={collab.id}
                title={collab.name}
                style={{ backgroundColor: collab.color }}
                className="w-7 h-7 rounded-full border-2 border-[#000000] flex items-center justify-center font-bold text-[11px] text-[#FFFFFF]"
              >
                {collab.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="w-7 h-7 rounded-full bg-[#202224] border-2 border-[#000000] flex items-center justify-center font-bold text-[10px] text-[#0DCC5C]">
                +{overflowCount}
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-[#7F867F] hidden sm:inline">
            {collaborators.length} online
          </span>
        </div>

        {/* Lobby Exit Button */}
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            title="Return to Team Lobby"
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-[#7F867F] hover:text-rose-400 hover:border-rose-500/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobby</span>
          </button>
        )}
      </div>
    </header>
  );
};
