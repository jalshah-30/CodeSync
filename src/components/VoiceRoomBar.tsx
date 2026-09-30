import React, { useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, Radio, Headphones, AlertCircle, Volume1, Video } from "lucide-react";
import { Collaborator } from "../types";
import { MicPermissionStatus } from "../utils/voiceManager";

interface VoiceRoomBarProps {
  collaborators: Collaborator[];
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser: { id: string; name: string; color: string };
  isLocalSpeaking?: boolean;
  volumeLevel?: number;
  permissionStatus?: MicPermissionStatus;
  permissionError?: string;
  isDeafened?: boolean;
  onToggleDeafen?: () => void;
  isLoopbackActive?: boolean;
  onToggleLoopback?: () => void;
  onPlayTestChime?: () => void;
  onOpenVideoChat?: () => void;
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
  onPlayTestChime,
  onOpenVideoChat,
}) => {
  return (
    <div className="flex flex-col border-b border-[#1E2021] bg-[#121416] text-xs select-none text-[#FFFFFF]">
      {permissionStatus === "requesting" && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#0D6430] text-[#0DCC5C] text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-[#0DCC5C] shrink-0" />
            <span>Requesting microphone access. Please click Allow in your browser.</span>
          </div>
        </div>
      )}

      {permissionStatus === "denied" && (
        <div className="flex items-center justify-between px-4 py-2 bg-rose-950/70 text-rose-300 border-b border-rose-500/40 text-[11px]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Microphone access blocked. Please allow permissions in browser address bar.</span>
          </div>
          <button
            onClick={onToggleMute}
            className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-semibold transition active:scale-95"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#FFFFFF]">
            <Radio className="w-3.5 h-3.5 text-[#0DCC5C]" />
            <span>Audio Mesh Live</span>
          </div>

          <span className="text-[#7F867F]">•</span>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-xs ${
                !isMuted ? "bg-[#0D6430] border-[#0DCC5C]/40 text-[#0DCC5C] font-semibold" : "bg-[#202224] border-[#1E2021] text-[#7F867F]"
              }`}
            >
              <span
                style={{ backgroundColor: currentUser.color }}
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border border-[#000000]"
              />
              <span className="font-semibold text-[#FFFFFF]">{currentUser.name} (You)</span>
              {isMuted ? (
                <MicOff className="w-3 h-3 text-rose-400" />
              ) : (
                <Mic className="w-3 h-3 text-[#0DCC5C]" />
              )}
            </div>

            {collaborators
              .filter((c) => c.id !== currentUser.id)
              .map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1E2021] bg-[#202224] text-[#7F867F] text-xs"
                >
                  <span
                    style={{ backgroundColor: collab.color }}
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border border-[#000000]"
                  />
                  <span className="font-medium text-[#FFFFFF]">{collab.name}</span>
                  {collab.isMuted ? (
                    <MicOff className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-[#0DCC5C]" />
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenVideoChat && (
            <button
              onClick={onOpenVideoChat}
              className="btn-accent flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold"
            >
              <Video className="w-3.5 h-3.5 text-[#03110A]" />
              <span>Video off — click to join</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full border font-semibold text-xs transition active:scale-95 ${
              isMuted
                ? "btn-secondary text-[#7F867F]"
                : "btn-accent text-[#03110A]"
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-[#03110A]" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
