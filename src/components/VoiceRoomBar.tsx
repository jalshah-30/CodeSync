import React from "react";
import { Mic, MicOff, Volume2, VolumeX, Radio, Headphones, AlertCircle } from "lucide-react";
import { Collaborator } from "../types";
import { MicPermissionStatus } from "../utils/voiceManager";

interface VoiceRoomBarProps {
  collaborators: Collaborator[];
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser: { id: string; name: string; color: string };
  isLocalSpeaking?: boolean;
  volumeLevel?: number; // 0 - 100
  permissionStatus?: MicPermissionStatus;
  permissionError?: string;
  isDeafened?: boolean;
  onToggleDeafen?: () => void;
  isLoopbackActive?: boolean;
  onToggleLoopback?: () => void;
}

export const VoiceRoomBar: React.FC<VoiceRoomBarProps> = ({
  collaborators,
  isMuted,
  onToggleMute,
  currentUser,
  isLocalSpeaking = false,
  volumeLevel = 0,
  permissionStatus = "idle",
  permissionError,
  isDeafened = false,
  onToggleDeafen,
  isLoopbackActive = false,
  onToggleLoopback,
}) => {
  return (
    <div className="flex flex-col border-b border-royal/40 bg-surface text-xs select-none text-cream">
      {/* Permission Warning */}
      {permissionStatus === "denied" && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-[11px]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              <strong>Microphone access blocked:</strong> {permissionError || "Please allow microphone permissions in browser."}
            </span>
          </div>
          <button
            onClick={onToggleMute}
            className="px-2 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {permissionStatus === "no-device" && (
        <div className="flex items-center gap-2 px-4 py-1 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>No microphone detected. Plug in a headset to speak.</span>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-1.5">
        {/* Left: Mesh Status & Participants */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 text-cream/80 font-medium shrink-0">
            <Radio className="w-3.5 h-3.5 text-[#52B788]" />
            <span className="hidden sm:inline">Voice mesh</span>
          </div>

          <span className="text-royal hidden sm:inline">•</span>

          {/* Collaborators in Voice */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Current User */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition ${
                !isMuted && isLocalSpeaking
                  ? "bg-ink border-[#52B788] text-cream"
                  : !isMuted
                  ? "bg-ink border-royal/60 text-cream"
                  : "bg-ink border-royal/30 text-cream/70"
              }`}
            >
              <span
                style={{ backgroundColor: currentUser.color }}
                className="w-2 h-2 rounded-full inline-block shrink-0"
              />
              <span className="font-medium">{currentUser.name} (You)</span>

              {isMuted ? (
                <MicOff className="w-3 h-3 text-cream/40 shrink-0" />
              ) : (
                <div className="flex items-center gap-1">
                  <Mic className="w-3 h-3 text-[#52B788] shrink-0" />
                  {/* Real-time volume meter without neon glow */}
                  <div className="flex items-end gap-0.5 h-3 px-0.5">
                    <span
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        volumeLevel > 5 ? "bg-[#52B788]" : "bg-royal"
                      }`}
                      style={{ height: `${Math.max(2, Math.min(12, (volumeLevel / 100) * 12))}px` }}
                    />
                    <span
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        volumeLevel > 25 ? "bg-[#52B788]" : "bg-royal"
                      }`}
                      style={{ height: `${Math.max(2, Math.min(12, (volumeLevel / 100) * 12))}px` }}
                    />
                    <span
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        volumeLevel > 50 ? "bg-[#52B788]" : "bg-royal"
                      }`}
                      style={{ height: `${Math.max(2, Math.min(12, (volumeLevel / 100) * 12))}px` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remote Collaborators */}
            {collaborators
              .filter((c) => c.id !== currentUser.id)
              .map((collab) => (
                <div
                  key={collab.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition ${
                    collab.isSpeaking
                      ? "bg-ink border-[#52B788] text-cream"
                      : "bg-ink border-royal/30 text-cream/70"
                  }`}
                >
                  <span
                    style={{ backgroundColor: collab.color }}
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                  />
                  <span className="font-medium">{collab.name}</span>
                  {collab.isMuted ? (
                    <MicOff className="w-3 h-3 text-cream/40 shrink-0" />
                  ) : (
                    <Mic className="w-3 h-3 text-[#52B788] shrink-0" />
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Test Mic */}
          <button
            onClick={onToggleLoopback}
            title={
              isLoopbackActive
                ? "Self-Test Active: Hearing own mic (Click to stop)"
                : "Test Mic: Hear own voice"
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-medium text-[11px] transition ${
              isLoopbackActive
                ? "bg-ink border-cream text-cream"
                : "bg-ink border-royal/40 text-cream/60 hover:text-cream"
            }`}
          >
            <Headphones className="w-3 h-3" />
            <span className="hidden md:inline">{isLoopbackActive ? "Testing" : "Test mic"}</span>
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border font-medium text-xs transition ${
              isMuted
                ? "bg-ink border-royal/50 text-cream/70 hover:text-cream"
                : "bg-ink border-[#52B788] text-[#52B788]"
            }`}
          >
            {isMuted ? <MicOff className="w-3 h-3 text-cream/40" /> : <Mic className="w-3 h-3 text-[#52B788]" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          {/* Deafen */}
          {onToggleDeafen && (
            <button
              onClick={onToggleDeafen}
              title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
              className={`p-1.5 rounded-full border transition ${
                isDeafened
                  ? "bg-ink border-rose-400 text-rose-300"
                  : "bg-ink border-royal/40 text-cream/60 hover:text-cream"
              }`}
            >
              {isDeafened ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
