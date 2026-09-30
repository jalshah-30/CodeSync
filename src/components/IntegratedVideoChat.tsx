import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  Users,
  GraduationCap,
  Shield,
  Layers,
  Grid3X3,
  Copy,
  Check,
  Activity,
  MessageSquare,
  Send,
  Volume2,
  Headphones,
  Sparkles,
  X,
} from "lucide-react";
import { Collaborator, ChatMessage } from "../types";
import { MicPermissionStatus } from "../utils/voiceManager";

export interface VideoParticipant {
  id: string;
  socketId?: string;
  name: string;
  color: string;
  isCameraOn: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  role: "teacher" | "student";
}

interface IntegratedVideoChatProps {
  currentUser: { id: string; name: string; color: string };
  collaborators: Collaborator[];
  isMuted: boolean;
  onToggleMute: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  isHandRaised: boolean;
  onToggleHandRaise: () => void;
  onPlayChime?: () => void;
  userRole?: "teacher" | "student";
  onToggleRole?: () => void;
  className?: string;
  layoutMode?: "compact" | "grid";
  onLayoutChange?: (mode: "compact" | "grid") => void;
  roomId?: string;
  socket?: Socket | null;
  remoteStreams?: Record<string, MediaStream>;
  onLocalVideoStream?: (stream: MediaStream | null) => void;
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
  volumeLevel?: number;
  isLocalSpeaking?: boolean;
  isDeafened?: boolean;
  onToggleDeafen?: () => void;
  micStatus?: MicPermissionStatus;
  micError?: string;
  onClose?: () => void;
}

const RemoteVideoPlayer: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el && stream) {
      if (el.srcObject !== stream) {
        el.srcObject = stream;
      }
      el.defaultMuted = true;
      el.muted = true;
      el.play().catch(() => {});
    }
  }, [stream]);

  return (
    <video
      ref={(el) => {
        videoRef.current = el;
        if (el && stream && el.srcObject !== stream) {
          el.srcObject = stream;
          el.defaultMuted = true;
          el.muted = true;
          el.play().catch(() => {});
        }
      }}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover transform -scale-x-100"
    />
  );
};

export const IntegratedVideoChat: React.FC<IntegratedVideoChatProps> = ({
  currentUser,
  collaborators,
  isMuted,
  onToggleMute,
  isCameraOn,
  onToggleCamera,
  isHandRaised,
  onToggleHandRaise,
  userRole = "student",
  className = "",
  roomId,
  socket,
  remoteStreams = {},
  onLocalVideoStream,
  onClose,
}) => {
  const [remoteVideoFrames, setRemoteVideoFrames] = useState<Record<string, string>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const virtualCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let active = true;
    let virtualAnimInterval: any = null;

    if (isCameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 320, height: 240 } })
        .then((stream) => {
          if (!active) return;
          setLocalStream(stream);
          onLocalVideoStream?.(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          const vCanvas = document.createElement("canvas");
          vCanvas.width = 280;
          vCanvas.height = 210;
          const vCtx = vCanvas.getContext("2d");
          virtualCanvasRef.current = vCanvas;

          let tick = 0;
          virtualAnimInterval = setInterval(() => {
            if (!vCtx) return;
            tick++;
            vCtx.fillStyle = "#07090A";
            vCtx.fillRect(0, 0, 280, 210);

            vCtx.fillStyle = currentUser.color;
            vCtx.beginPath();
            vCtx.arc(140, 90, 35, 0, Math.PI * 2);
            vCtx.fill();

            vCtx.fillStyle = "#FFFFFF";
            vCtx.font = "bold 16px Inter, sans-serif";
            vCtx.textAlign = "center";
            vCtx.fillText(currentUser.name.slice(0, 2).toUpperCase(), 140, 96);
          }, 200);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      virtualCanvasRef.current = null;
      onLocalVideoStream?.(null);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      active = false;
      if (virtualAnimInterval) clearInterval(virtualAnimInterval);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn]);

  const classroomCohort: VideoParticipant[] = [
    {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      color: currentUser.color,
      isCameraOn,
      isMuted,
      isSpeaking: false,
      isHandRaised,
      role: userRole,
    },
    ...collaborators
      .filter((c) => c.id !== currentUser.id)
      .map((c) => ({
        id: c.id,
        socketId: c.socketId,
        name: c.name,
        color: c.color,
        isCameraOn: !!c.isCameraOn,
        isMuted: c.isMuted ?? true,
        isSpeaking: !!c.isSpeaking,
        isHandRaised: !!c.isHandRaised,
        role: c.role || "student",
      })),
  ];

  const raisedHandsCount = classroomCohort.filter((p) => p.isHandRaised).length;

  return (
    <div className={`bg-[#17191A] border-b border-[#1E2021] text-[#FFFFFF] select-none flex flex-col h-full overflow-hidden ${className}`}>
      {/* Hand Raised Banner */}
      {raisedHandsCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#0D6430] border-b border-[#0DCC5C]/30 text-xs font-semibold text-[#0DCC5C]">
          <span>✋ {raisedHandsCount} raised hand(s) in room</span>
        </div>
      )}

      {/* Control Header */}
      <div className="p-2.5 border-b border-[#1E2021] bg-[#121416] flex items-center justify-between flex-wrap gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFFFFF]">
          <Video className="w-4 h-4 text-[#0DCC5C]" />
          <span>Video Studio</span>
          <span className="px-2 py-0.5 rounded-full bg-[#202224] text-[10px] text-[#0DCC5C] border border-[#1E2021] font-semibold">
            {classroomCohort.length} Present
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCamera}
            className={`p-1.5 rounded-full border text-xs transition active:scale-95 ${
              isCameraOn ? "bg-[#0D6430] text-[#0DCC5C] border-[#0DCC5C]/30" : "bg-[#202224] text-[#7F867F] border-[#1E2021] hover:text-[#FFFFFF]"
            }`}
            title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-full border text-xs transition active:scale-95 ${
              !isMuted ? "bg-[#0D6430] text-[#0DCC5C] border-[#0DCC5C]/30 font-semibold" : "bg-[#202224] text-[#7F867F] border-[#1E2021] hover:text-[#FFFFFF]"
            }`}
            title={!isMuted ? "Mute Mic" : "Unmute Mic"}
          >
            {!isMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleHandRaise}
            className={`p-1.5 rounded-full border text-xs transition active:scale-95 ${
              isHandRaised ? "bg-[#0D6430] text-[#0DCC5C] border-[#0DCC5C]/30 font-bold" : "bg-[#202224] text-[#7F867F] border-[#1E2021] hover:text-[#FFFFFF]"
            }`}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#202224] text-[#7F867F] hover:text-[#FFFFFF] border border-[#1E2021] transition"
              title="Minimize Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Stream Tiles Grid (Black background tiles) */}
      <div className="flex-1 p-2 overflow-y-auto grid grid-cols-2 gap-2 bg-[#000000]">
        {classroomCohort.map((participant) => {
          const isSelf = participant.id === currentUser.id || (participant.socketId && participant.socketId === socket?.id);
          const remoteStream = remoteStreams[participant.id] || (participant.socketId ? remoteStreams[participant.socketId] : undefined);
          const remoteFrame = remoteVideoFrames[participant.id] || (participant.socketId ? remoteVideoFrames[participant.socketId] : undefined);
          const hasLiveWebRtcStream = remoteStream && remoteStream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled);

          return (
            <div
              key={participant.socketId || participant.id}
              className={`relative rounded-xl overflow-hidden bg-[#07090A] border ${
                participant.isSpeaking
                  ? "border-[#0DCC5C] ring-2 ring-[#0DCC5C]/50"
                  : participant.isHandRaised
                  ? "border-amber-400 ring-2 ring-amber-400/50"
                  : "border-[#1E2021]"
              } flex flex-col justify-between aspect-video min-h-[90px] shadow-sm`}
            >
              <div className="relative w-full h-full flex items-center justify-center bg-[#000000]">
                {isSelf && isCameraOn ? (
                  <video
                    ref={(el) => {
                      localVideoRef.current = el;
                      if (el && localStream) {
                        if (el.srcObject !== localStream) el.srcObject = localStream;
                        el.defaultMuted = true;
                        el.muted = true;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : !isSelf && hasLiveWebRtcStream ? (
                  <RemoteVideoPlayer stream={remoteStream!} />
                ) : !isSelf && remoteFrame ? (
                  <img src={remoteFrame} alt={participant.name} className="w-full h-full object-cover transform -scale-x-100" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                      style={{ backgroundColor: participant.color }}
                    >
                      {participant.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Participant Name overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 flex items-center justify-between text-[10px] text-white">
                <span className="truncate max-w-[80px] font-semibold">{participant.name}</span>
                {participant.isMuted ? (
                  <MicOff className="w-3 h-3 text-rose-400" />
                ) : (
                  <Mic className="w-3 h-3 text-[#0DCC5C]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
