import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import confetti from "canvas-confetti";
import {
  Sparkles,
  MessageSquare,
  Activity,
  ChevronRight,
  Code2,
  Bug,
  Video,
} from "lucide-react";
import {
  Collaborator,
  SupportedLanguage,
  EditorTheme,
  ChatMessage,
  ActivityLog,
  LineAuthor,
  ErrorAttribution,
  STEMLab,
  DebuggingHypothesis,
  STEMStudentProgress,
} from "./types";
import {
  generateInitialLineAuthors,
  updateLineAuthors,
} from "./utils/authorship";
import {
  SUPPORTED_LANGUAGES,
  STARTER_TEMPLATES,
  COLLABORATOR_COLORS,
} from "./utils/constants";
import { STEM_LABS } from "./utils/stemCurriculum";
import { Navbar } from "./components/Navbar";
import { CodeEditor } from "./components/CodeEditor";
import { TerminalPanel } from "./components/TerminalPanel";
import { VoiceRoomBar } from "./components/VoiceRoomBar";
import { IntegratedVideoChat } from "./components/IntegratedVideoChat";
import { AiPanel } from "./components/AiPanel";
import { ChatPanel } from "./components/ChatPanel";
import { ActivityLogPanel } from "./components/ActivityLogPanel";
import { CollaborativeDebugPanel } from "./components/CollaborativeDebugPanel";
import { LearnerProgressModal } from "./components/LearnerProgressModal";
import { RoomModal } from "./components/RoomModal";
import { TeamLobby } from "./components/TeamLobby";
import { VoiceManager, MicPermissionStatus } from "./utils/voiceManager";

const getInitialStudentProgress = (userName: string, userId: string): STEMStudentProgress => {
  try {
    const saved = localStorage.getItem(`codesync_progress_${userId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return {
    userId,
    userName,
    completedLabs: ["stem-physics-projectile"],
    streakDays: 4,
    totalRuns: 18,
    errorsResolved: 7,
    conceptsMastered: [
      "Kinematic Equations",
      "Calculus Quadrature",
      "Variable Scoping",
      "Definite Integration",
    ],
    skillScores: {
      physicsMath: 86,
      algorithmicThinking: 82,
      syntaxPrecision: 88,
      debuggingPersistence: 92,
      codeElegance: 85,
    },
    badges: [
      {
        id: "badge-rocket",
        title: "Rocket Kinematics Specialist",
        icon: "🚀",
        description: "Derived 2D ballistic trajectories with air-time calculations.",
        unlockedAt: Date.now() - 86400000,
      },
      {
        id: "badge-syntax-sleuth",
        title: "Precision Coder",
        icon: "🔍",
        description: "Mastered error analysis with step-by-step resolution.",
        unlockedAt: Date.now() - 43200000,
      },
      {
        id: "badge-team-pilot",
        title: "Collaborative Scholar",
        icon: "🧭",
        description: "Collaborated in an integrated STEM virtual classroom session.",
        unlockedAt: Date.now() - 20000000,
      },
    ],
  };
};

export default function App() {
  const [isInRoom, setIsInRoom] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const tabUniqueId = `usr-${Date.now().toString(36).slice(-4)}-${Math.random().toString(36).substring(2, 7)}`;
    const savedName = localStorage.getItem("codesync_username") || "Jal Shah";
    const randomColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
    return {
      id: tabUniqueId,
      name: savedName,
      color: randomColor,
    };
  });

  const [userRole, setUserRole] = useState<"teacher" | "student">("student");

  const [roomId, setRoomId] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "ABC123";
  });
  const [roomName, setRoomName] = useState<string>("Physics & Creative Code Studio");
  const [hasPassword, setHasPassword] = useState<boolean>(false);

  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [theme, setTheme] = useState<EditorTheme>(() => {
    return (localStorage.getItem("codesync_editor_theme") as EditorTheme) || "ocean-cream";
  });

  useEffect(() => {
    localStorage.setItem("codesync_editor_theme", theme);
  }, [theme]);
  const [fontSize, setFontSize] = useState<number>(15);
  const [code, setCode] = useState<string>(STEM_LABS[0].starterCode.python);
  const [lineAuthors, setLineAuthors] = useState<Record<number, LineAuthor>>(() =>
    generateInitialLineAuthors(STEM_LABS[0].starterCode.python, [], currentUser)
  );
  const [errorAttribution, setErrorAttribution] = useState<ErrorAttribution | null>(null);

  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [executionTime, setExecutionTime] = useState<string>("0.00");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [showVideoChat, setShowVideoChat] = useState<boolean>(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [videoLayout, setVideoLayout] = useState<"compact" | "grid">("compact");
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const isMutedRef = useRef<boolean>(true);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0);
  const [micStatus, setMicStatus] = useState<MicPermissionStatus>("idle");
  const [micError, setMicError] = useState<string>("");
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isLoopbackActive, setIsLoopbackActive] = useState<boolean>(false);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [activeStemLab, setActiveStemLab] = useState<STEMLab | null>(STEM_LABS[0]);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [studentProgress, setStudentProgress] = useState<STEMStudentProgress>(() =>
    getInitialStudentProgress(currentUser.name, currentUser.id)
  );

  const [hypotheses, setHypotheses] = useState<DebuggingHypothesis[]>([]);
  const [sharedBreakpoints, setSharedBreakpoints] = useState<number[]>([]);

  const [sidePanelTab, setSidePanelTab] = useState<"ai" | "chat" | "debug" | "activity" | "closed">("ai");
  const [aiInitialTab, setAiInitialTab] = useState<
    "explain" | "quality" | "debug" | "review" | "generate" | "chat"
  >("explain");
  const [explainTrigger, setExplainTrigger] = useState<number>(0);

  const [modalMode, setModalMode] = useState<"create" | "join" | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Layout Drag Resizing State + LocalStorage Persistence
  const [editorRatio, setEditorRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("codesync_editor_ratio");
      if (saved) return parseFloat(saved);
    } catch (e) {}
    return 65; // Default 65% editor, 35% terminal
  });

  const [sidePanelWidth, setSidePanelWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("codesync_panel_width");
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 360; // Default 360px
  });

  const [videoSectionHeight, setVideoSectionHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("codesync_video_height");
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 200; // Default 200px
  });

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  // Persist Resizable Dimensions
  useEffect(() => {
    try {
      localStorage.setItem("codesync_editor_ratio", editorRatio.toString());
    } catch (e) {}
  }, [editorRatio]);

  useEffect(() => {
    try {
      localStorage.setItem("codesync_panel_width", sidePanelWidth.toString());
    } catch (e) {}
  }, [sidePanelWidth]);

  useEffect(() => {
    try {
      localStorage.setItem("codesync_video_height", videoSectionHeight.toString());
    } catch (e) {}
  }, [videoSectionHeight]);

  // Editor vs Terminal Vertical Split Drag Handler
  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = mainContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const handleMouseMove = (moveEvt: MouseEvent) => {
      const offsetY = moveEvt.clientY - rect.top;
      const totalH = rect.height;
      let ratio = (offsetY / totalH) * 100;
      // Clamp editor ratio so editor and terminal both maintain min height (~160px)
      const minRatio = (160 / totalH) * 100;
      const maxRatio = ((totalH - 160) / totalH) * 100;
      ratio = Math.max(minRatio, Math.min(maxRatio, ratio));
      setEditorRatio(ratio);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Right Side Panel Width Drag Handler
  const handlePanelWidthMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvt: MouseEvent) => {
      const newWidth = window.innerWidth - moveEvt.clientX;
      const clampedWidth = Math.max(280, Math.min(560, newWidth));
      setSidePanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Docked Video Chat Vertical Drag Handler inside Right Panel
  const handleVideoHeightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const panel = rightPanelRef.current;
    if (!panel) return;

    const panelRect = panel.getBoundingClientRect();
    const handleMouseMove = (moveEvt: MouseEvent) => {
      const offsetY = moveEvt.clientY - panelRect.top;
      const totalH = panelRect.height;
      // Clamp video height between min 120px and max (leaving at least 200px for tabs)
      const clampedHeight = Math.max(120, Math.min(totalH - 200, offsetY));
      setVideoSectionHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
    try {
      sessionStorage.setItem("codesync_session_user", JSON.stringify(currentUser));
      localStorage.setItem("codesync_username", currentUser.name);
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`codesync_progress_${currentUser.id}`, JSON.stringify(studentProgress));
    } catch (e) {}
  }, [studentProgress, currentUser.id]);

  useEffect(() => {
    if (isInRoom && roomId) {
      window.location.hash = roomId;
    }
  }, [isInRoom, roomId]);

  useEffect(() => {
    if (!isInRoom) return;

    const socket = io({
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    setSocket(socket);

    const vm = new VoiceManager({
      onSpeakingChange: (speaking) => {
        setIsLocalSpeaking(speaking);
        if (socketRef.current) {
          socketRef.current.emit("voice-state", {
            roomId,
            isMuted: isMutedRef.current,
            isSpeaking: speaking,
          });
        }
      },
      onVolumeChange: (vol) => {
        setLocalVolume(vol);
      },
      onStatusChange: (status, errMsg) => {
        setMicStatus(status);
        if (errMsg) setMicError(errMsg);
      },
      sendSignal: (targetSocketId, signal) => {
        socketRef.current?.emit("webrtc-signal", {
          targetSocketId,
          signal,
        });
      },
      onRemoteStream: (targetSocketId, stream) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: stream,
        }));
      },
    });
    voiceManagerRef.current = vm;

    socket.emit("join-room", {
      roomId,
      user: {
        id: currentUserRef.current.id,
        name: currentUserRef.current.name,
        color: currentUserRef.current.color,
        isMuted,
        isSpeaking: false,
        isCameraOn,
        isHandRaised,
        role: userRole,
        joinedAt: Date.now(),
      },
    });

    socket.on("room-state", (data) => {
      if (data.assignedUser) {
        setCurrentUser((prev: any) => ({
          ...prev,
          id: data.assignedUser.id,
          name: data.assignedUser.name,
        }));
      }
      if (data.code !== undefined) setCode(data.code);
      if (data.language) setLanguage(data.language);
      if (data.roomName) setRoomName(data.roomName);
      if (data.input !== undefined) setInput(data.input);
      if (data.output !== undefined) setOutput(data.output);
      if (data.executionStatus) setExecutionStatus(data.executionStatus);
      if (data.executionTime) setExecutionTime(data.executionTime);
      if (data.messages) setMessages(data.messages);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.activeStemLab) setActiveStemLab(data.activeStemLab);
      if (data.hypotheses) setHypotheses(data.hypotheses);
      if (data.sharedBreakpoints) setSharedBreakpoints(data.sharedBreakpoints);
      if (data.lineAuthors) {
        setLineAuthors(data.lineAuthors);
      } else if (data.code) {
        setLineAuthors(generateInitialLineAuthors(data.code, data.members || [], currentUser));
      }
      if (data.errorAttribution !== undefined) {
        setErrorAttribution(data.errorAttribution);
      }
      if (data.members) {
        setCollaborators(data.members);
        const activeSocketIds = new Set<string>();
        data.members.forEach((m: Collaborator) => {
          if (m.socketId) activeSocketIds.add(m.socketId);
          if (m.socketId && socket.id && m.socketId !== socket.id) {
            const isInitiator = socket.id < m.socketId;
            vm.connectToPeer(m.socketId, isInitiator);
          }
        });
        vm.cleanDisconnectedPeers(activeSocketIds);
      }
    });

    socket.on("code-update", ({ code: remoteCode, senderSocketId, lineAuthors: remoteLineAuthors }) => {
      if (senderSocketId && socketRef.current && senderSocketId === socketRef.current.id) return;
      setCode(remoteCode);
      if (remoteLineAuthors) setLineAuthors(remoteLineAuthors);
    });

    socket.on("cursor-update", ({ senderSocketId, userId, userName, userColor, cursor }) => {
      if (senderSocketId && socketRef.current && senderSocketId === socketRef.current.id) return;
      const trackerId = senderSocketId || userId;
      setCollaborators((prev) => {
        const index = prev.findIndex(
          (c) =>
            c.id === trackerId ||
            (senderSocketId && c.socketId === senderSocketId) ||
            (c.id === userId && !c.socketId)
        );
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            cursor,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: trackerId,
              name: userName || "Collaborator",
              color: userColor || "#333333",
              socketId: senderSocketId,
              cursor,
              isMuted: true,
              isSpeaking: false,
            },
          ];
        }
      });
    });

    socket.on("language-update", ({ language: remoteLang }) => {
      if (remoteLang) setLanguage(remoteLang);
    });

    socket.on("stdin-update", ({ input: remoteInput }) => {
      if (remoteInput !== undefined) setInput(remoteInput);
    });

    socket.on("output-update", ({ output: remoteOutput, status: remoteStatus, executionTime: remoteTime, errorAttribution: remoteError }) => {
      if (remoteOutput !== undefined) setOutput(remoteOutput);
      if (remoteStatus) setExecutionStatus(remoteStatus);
      if (remoteTime) setExecutionTime(remoteTime);
      setErrorAttribution(remoteError || null);
    });

    socket.on("members-update", (members: Collaborator[]) => {
      setCollaborators(members);
      const activeSocketIds = new Set<string>();
      members.forEach((m) => {
        if (m.socketId) activeSocketIds.add(m.socketId);
        if (m.socketId && socket.id && m.socketId !== socket.id) {
          const isInitiator = socket.id < m.socketId;
          vm.connectToPeer(m.socketId, isInitiator);
        }
      });
      vm.cleanDisconnectedPeers(activeSocketIds);
    });

    socket.on("webrtc-signal", ({ senderSocketId, signal }) => {
      vm.handleSignal(senderSocketId, signal);
    });

    socket.on("user-video-update", ({ userId, senderSocketId, isCameraOn: remoteCam, isHandRaised: remoteHand, role: remoteRole }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === userId || (senderSocketId && c.socketId === senderSocketId)
            ? {
                ...c,
                isCameraOn: remoteCam ?? c.isCameraOn,
                isHandRaised: remoteHand ?? c.isHandRaised,
                role: remoteRole ?? c.role,
              }
            : c
        )
      );
    });

    socket.on("hand-raised-update", ({ userId, userName, isHandRaised: remoteHand }) => {
      setCollaborators((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, isHandRaised: remoteHand } : c))
      );
    });

    socket.on("hypothesis-added", (newHypo: DebuggingHypothesis) => {
      setHypotheses((prev) => [newHypo, ...prev]);
    });

    socket.on("hypothesis-updated", (updatedHypo: DebuggingHypothesis) => {
      setHypotheses((prev) => prev.map((h) => (h.id === updatedHypo.id ? updatedHypo : h)));
    });

    socket.on("breakpoints-updated", (lines: number[]) => {
      setSharedBreakpoints(lines);
    });

    socket.on("new-message", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("activity-log", (log: ActivityLog) => {
      setActivityLogs((prev) => {
        if (prev.some((l) => l.id === log.id)) return prev;
        return [...prev, log];
      });
    });

    socket.on("user-voice-update", ({ userId, senderSocketId, isMuted: remoteMuted, isSpeaking: remoteSpeaking }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === userId || (senderSocketId && c.socketId === senderSocketId)
            ? { ...c, isMuted: remoteMuted, isSpeaking: remoteSpeaking }
            : c
        )
      );
    });

    return () => {
      vm.destroy();
      voiceManagerRef.current = null;
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isInRoom, roomId]);

  const handleCodeChange = useCallback(
    (newCode: string, changeDetails?: { line: number; summary: string }) => {
      setLineAuthors((prevAuthors) => {
        const updated = updateLineAuthors(
          prevAuthors,
          code,
          newCode,
          currentUser,
          changeDetails?.line
        );
        if (socketRef.current) {
          socketRef.current.emit("code-change", {
            roomId,
            code: newCode,
            changeInfo: changeDetails,
            lineAuthors: updated,
          });
        }
        return updated;
      });
      setCode(newCode);

      if (errorAttribution?.line && changeDetails?.line === errorAttribution.line) {
        setErrorAttribution(null);
      }
    },
    [roomId, code, currentUser, errorAttribution]
  );

  const handleCursorChange = useCallback(
    (line: number, ch: number) => {
      if (socketRef.current) {
        socketRef.current.emit("cursor-move", {
          roomId,
          cursor: { line, ch },
        });
      }
    },
    [roomId]
  );

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (!code.trim() || code === STARTER_TEMPLATES[language]) {
      const template = STARTER_TEMPLATES[newLang] || `// ${newLang} code\n`;
      setCode(template);
      const newAuthors = generateInitialLineAuthors(template, collaborators, currentUser);
      setLineAuthors(newAuthors);
      if (socketRef.current) {
        socketRef.current.emit("code-change", {
          roomId,
          code: template,
          changeInfo: { line: 1, summary: `switched to ${newLang}` },
          lineAuthors: newAuthors,
        });
      }
    }
    if (socketRef.current) {
      socketRef.current.emit("language-change", {
        roomId,
        language: newLang,
      });
    }
  };

  const handleInputChange = (newInput: string) => {
    setInput(newInput);
    if (socketRef.current) {
      socketRef.current.emit("stdin-change", {
        roomId,
        input: newInput,
      });
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionStatus("running");
    setOutput("Executing code...");
    setErrorAttribution(null);

    setStudentProgress((prev) => ({
      ...prev,
      totalRuns: prev.totalRuns + 1,
    }));

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          input,
          roomId,
          lineAuthors,
          currentUser,
        }),
      });

      const data = await res.json();
      setOutput(data.output || data.stdout || "Program finished with no output.");
      setExecutionStatus(data.status || "success");
      setExecutionTime(data.time || "0.00");
      setErrorAttribution(data.errorAttribution || null);

      if (data.status === "success") {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ["#333333", "#E1F4F3", "#706C61"],
        });
      }
    } catch (err: any) {
      setOutput(`Execution fault: ${err.message || "Unknown error"}`);
      setExecutionStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleCamera = () => {
    const next = !isCameraOn;
    setIsCameraOn(next);
    if (socketRef.current) {
      socketRef.current.emit("video-state", {
        roomId,
        isCameraOn: next,
        isHandRaised,
        role: userRole,
      });
    }
  };

  const handleToggleHandRaise = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (socketRef.current) {
      socketRef.current.emit("raise-hand", {
        roomId,
        isHandRaised: next,
      });
    }
  };

  const handleToggleRole = () => {
    const next = userRole === "teacher" ? "student" : "teacher";
    setUserRole(next);
    if (socketRef.current) {
      socketRef.current.emit("video-state", {
        roomId,
        role: next,
      });
    }
  };

  const handleSelectStemLab = (lab: STEMLab) => {
    setActiveStemLab(lab);
    const starter = lab.starterCode[language] || lab.starterCode.python || "";
    setCode(starter);
    setLineAuthors(generateInitialLineAuthors(starter, collaborators, currentUser));
    if (socketRef.current) {
      socketRef.current.emit("select-stem-lab", {
        roomId,
        lab,
        initialCode: starter,
      });
    }
  };

  const handleAddHypothesis = (text: string, lineTarget?: number) => {
    const newHypo: DebuggingHypothesis = {
      id: `hypo-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorColor: currentUser.color,
      text,
      lineTarget,
      status: "investigating",
      timestamp: Date.now(),
      upvotes: 1,
      upvotedBy: [currentUser.id],
    };
    setHypotheses((prev) => [newHypo, ...prev]);
    if (socketRef.current) {
      socketRef.current.emit("add-hypothesis", {
        roomId,
        hypothesis: newHypo,
      });
    }
  };

  const handleUpdateHypothesis = (
    id: string,
    status: "investigating" | "confirmed" | "resolved" | "dismissed",
    upvotes: string[]
  ) => {
    setHypotheses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status, upvotedBy: upvotes, upvotes: upvotes.length } : h))
    );
    if (socketRef.current) {
      socketRef.current.emit("update-hypothesis", {
        roomId,
        hypothesisId: id,
        status,
        upvotedBy: upvotes,
      });
    }
  };

  const handleToggleBreakpoint = (line: number) => {
    setSharedBreakpoints((prev) => {
      const next = prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line];
      if (socketRef.current) {
        socketRef.current.emit("toggle-breakpoint", {
          roomId,
          line,
        });
      }
      return next;
    });
  };

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderColor: currentUser.color,
      text,
      timestamp: Date.now(),
    };

    if (socketRef.current) {
      socketRef.current.emit("chat-message", {
        roomId,
        message: msg,
      });
    }
  };

  const handleToggleMic = async () => {
    const nextMuted = !isMuted;
    if (voiceManagerRef.current) {
      const ok = await voiceManagerRef.current.setMuted(nextMuted);
      if (!nextMuted && !ok) {
        setIsMuted(true);
        isMutedRef.current = true;
        return;
      }
    }
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (socketRef.current) {
      socketRef.current.emit("voice-state", {
        roomId,
        isMuted: nextMuted,
        isSpeaking: false,
      });
    }
  };

  const handleToggleDeafen = () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    if (voiceManagerRef.current) {
      voiceManagerRef.current.setDeafened(nextDeafened);
    }
  };

  const handleToggleLoopback = async () => {
    if (voiceManagerRef.current) {
      const active = await voiceManagerRef.current.toggleSelfLoopback();
      setIsLoopbackActive(active);
    }
  };

  const handlePlayTestChime = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.playTestChime();
    }
  };

  const handleCreateRoom = async (name: string, user: string, pass?: string, lang?: SupportedLanguage) => {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: name,
          userName: user,
          password: pass,
          language: lang || "python",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      const updatedUser = { ...currentUser, name: user };
      setCurrentUser(updatedUser);
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setLanguage(data.language);
      setCode(data.code);
      setLineAuthors(data.lineAuthors || generateInitialLineAuthors(data.code, [], updatedUser));
      setHasPassword(!!pass);
      setIsInRoom(true);
      setModalMode(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleJoinRoom = async (targetRoomId: string, user: string, pass?: string) => {
    try {
      const res = await fetch("/api/joinRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: targetRoomId,
          userName: user,
          password: pass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");

      const updatedUser = { ...currentUser, name: user };
      setCurrentUser(updatedUser);
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setLanguage(data.language);
      setCode(data.code);
      setInput(data.input || "");
      setOutput(data.output || "");
      setExecutionStatus(data.executionStatus || "idle");
      setExecutionTime(data.executionTime || "0.00");
      setMessages(data.messages || []);
      setActivityLogs(data.activityLogs || []);
      setHasPassword(!!data.hasPassword);
      setIsInRoom(true);
      setModalMode(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (voiceManagerRef.current) {
      voiceManagerRef.current.destroy();
      voiceManagerRef.current = null;
    }
    setIsInRoom(false);
  };

  if (!isInRoom) {
    return (
      <TeamLobby
        onJoinSuccess={(data) => {
          setCurrentUser((prev: any) => ({ ...prev, name: data.userName }));
          setRoomId(data.roomId);
          setRoomName(data.roomName);
          setLanguage(data.language);
          setCode(data.code);
          setHasPassword(data.hasPassword);
          if (data.lineAuthors) {
            setLineAuthors(data.lineAuthors);
          } else {
            setLineAuthors(
              generateInitialLineAuthors(data.code, [], { ...currentUser, name: data.userName })
            );
          }
          setIsInRoom(true);
        }}
        defaultUserName={currentUser.name}
        initialRoomId={window.location.hash.replace("#", "")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-base text-ink antialiased hero-radial-glow">
      {/* 1. Navbar */}
      <Navbar
        roomName={roomName}
        roomId={roomId}
        hasPassword={hasPassword}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        collaborators={collaborators}
        isMuted={isMuted}
        onToggleMic={handleToggleMic}
        onOpenCreateModal={() => setModalMode("create")}
        onOpenJoinModal={() => setModalMode("join")}
        onLeaveRoom={handleLeaveRoom}
        onOpenProgress={() => setIsProgressModalOpen(true)}
        showVideoChat={showVideoChat}
        onToggleVideoChat={() => setShowVideoChat(!showVideoChat)}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        userRole={userRole}
      />

      {/* 2. Main Workspace Layout */}
      <div ref={mainContainerRef} className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left / Center: Editor + Terminal Column with Live Drag Resizing */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top: Code Editor */}
          <div style={{ height: `${editorRatio}%` }} className="min-h-[160px]">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              language={language}
              theme={theme}
              fontSize={fontSize}
              collaborators={collaborators.filter(
                (c) => c.id !== currentUser.id && (!c.socketId || c.socketId !== socketRef.current?.id)
              )}
              lineAuthors={lineAuthors}
              errorAttribution={errorAttribution}
              onCursorChange={handleCursorChange}
              onRunCode={handleRunCode}
              onAskAiToExplain={() => {
                setSidePanelTab("ai");
                setAiInitialTab("explain");
                setExplainTrigger((prev) => prev + 1);
              }}
              isRunning={isRunning}
              sharedBreakpoints={sharedBreakpoints}
              onToggleBreakpoint={handleToggleBreakpoint}
            />
          </div>

          {/* Horizontal Split Drag Handle */}
          <div
            onMouseDown={handleSplitMouseDown}
            className="h-2 my-1 cursor-row-resize flex items-center justify-center rounded-full hover:bg-[#0DCC5C] bg-[#292C2D] active:bg-[#0DCC5C] transition-colors group z-20 shrink-0"
            title="Drag to resize Editor / Terminal split"
          >
            <div className="w-12 h-1 rounded-full bg-[#7F867F] group-hover:bg-[#03110A] transition-colors" />
          </div>

          {/* Bottom: Terminal Panel */}
          <div style={{ height: `${100 - editorRatio}%` }} className="min-h-[160px]">
            <TerminalPanel
              input={input}
              onInputChange={handleInputChange}
              output={output}
              onClearOutput={() => {
                setOutput("");
                setErrorAttribution(null);
              }}
              status={executionStatus}
              executionTime={executionTime}
              errorAttribution={errorAttribution}
              onRunCode={handleRunCode}
              onAskAiToDebug={() => {
                setSidePanelTab("ai");
                setAiInitialTab("debug");
              }}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Vertical Drag Handle for Right Panel Width */}
        {sidePanelTab !== "closed" && (
          <div
            onMouseDown={handlePanelWidthMouseDown}
            className="w-2 cursor-col-resize flex items-center justify-center rounded-full hover:bg-[#0DCC5C] bg-[#292C2D] active:bg-[#0DCC5C] transition-colors group z-20 shrink-0"
            title="Drag to resize side panel width"
          >
            <div className="w-1 h-12 rounded-full bg-[#7F867F] group-hover:bg-[#03110A] transition-colors" />
          </div>
        )}

        {/* Right Column: Docked Video Chat + Tabs Sidebar */}
        <div
          ref={rightPanelRef}
          style={{ width: sidePanelTab === "closed" ? "48px" : `${sidePanelWidth}px` }}
          className="flex flex-col h-full shrink-0 transition-all duration-150"
        >
          {sidePanelTab === "closed" ? (
            /* Collapsed Icon Dock */
            <div className="h-full rounded-2xl border border-[#1E2021] bg-[#17191A] p-2 flex flex-col items-center gap-3 shadow-md">
              <button
                onClick={() => setSidePanelTab("ai")}
                title="Open AI Tutor"
                className="p-2 rounded-xl bg-[#0DCC5C] text-[#03110A] hover:bg-[#0BB652] transition"
              >
                <Sparkles className="w-5 h-5 text-[#03110A]" />
              </button>
              <button
                onClick={() => setSidePanelTab("chat")}
                title="Open Classroom Chat"
                className="p-2 rounded-xl bg-[#202224] text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#292C2D] transition border border-[#292C2D]"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidePanelTab("activity")}
                title="Open Activity Log"
                className="p-2 rounded-xl bg-[#202224] text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#292C2D] transition border border-[#292C2D]"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded Resizable Right Panel holding Docked Video + Tabbed Sidebar */
            <div className="flex flex-col h-full rounded-2xl border border-[#1E2021] bg-[#17191A] shadow-lg overflow-hidden">
              {/* Docked Video Chat Section */}
              {showVideoChat ? (
                <div style={{ height: `${videoSectionHeight}px` }} className="min-h-[120px] shrink-0">
                  <IntegratedVideoChat
                    currentUser={currentUser}
                    collaborators={collaborators}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMic}
                    isCameraOn={isCameraOn}
                    onToggleCamera={handleToggleCamera}
                    isHandRaised={isHandRaised}
                    onToggleHandRaise={handleToggleHandRaise}
                    onPlayChime={handlePlayTestChime}
                    userRole={userRole}
                    onToggleRole={handleToggleRole}
                    layoutMode={videoLayout}
                    onLayoutChange={setVideoLayout}
                    roomId={roomId}
                    socket={socket}
                    remoteStreams={remoteStreams}
                    onLocalVideoStream={(stream) => {
                      voiceManagerRef.current?.setLocalVideoStream(stream);
                    }}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    volumeLevel={localVolume}
                    isLocalSpeaking={isLocalSpeaking}
                    isDeafened={isDeafened}
                    onToggleDeafen={handleToggleDeafen}
                    micStatus={micStatus}
                    micError={micError}
                    onClose={() => setShowVideoChat(false)}
                  />
                </div>
              ) : (
                /* Collapsed Slim Video Bar */
                <VoiceRoomBar
                  collaborators={collaborators}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMic}
                  currentUser={currentUser}
                  isLocalSpeaking={isLocalSpeaking}
                  volumeLevel={localVolume}
                  permissionStatus={micStatus}
                  permissionError={micError}
                  isDeafened={isDeafened}
                  onToggleDeafen={handleToggleDeafen}
                  isLoopbackActive={isLoopbackActive}
                  onToggleLoopback={handleToggleLoopback}
                  onPlayTestChime={handlePlayTestChime}
                  onOpenVideoChat={() => setShowVideoChat(true)}
                />
              )}

              {/* Video vs Tabs Vertical Drag Handle */}
              {showVideoChat && (
                <div
                  onMouseDown={handleVideoHeightMouseDown}
                  className="h-2 my-0.5 cursor-row-resize flex items-center justify-center rounded-full hover:bg-[#0DCC5C] bg-[#292C2D] active:bg-[#0DCC5C] transition-colors group z-20 shrink-0"
                  title="Drag to adjust Video Chat section height"
                >
                  <div className="w-10 h-1 rounded-full bg-[#7F867F] group-hover:bg-[#03110A] transition-colors" />
                </div>
              )}

              {/* Sidebar Tab Bar */}
              <div className="flex items-center justify-between p-2.5 border-b border-[#1E2021] bg-[#121416] select-none text-xs shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setSidePanelTab("ai")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition ${
                      sidePanelTab === "ai"
                        ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
                        : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] font-medium"
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${sidePanelTab === "ai" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
                    <span>AI Tutor</span>
                  </button>

                  <button
                    onClick={() => setSidePanelTab("chat")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition ${
                      sidePanelTab === "chat"
                        ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
                        : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] font-medium"
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 ${sidePanelTab === "chat" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setSidePanelTab("activity")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition ${
                      sidePanelTab === "activity"
                        ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
                        : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] font-medium"
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 ${sidePanelTab === "activity" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
                    <span>Logs</span>
                  </button>
                </div>

                <button
                  onClick={() => setSidePanelTab("closed")}
                  title="Collapse sidebar"
                  className="p-1.5 rounded-full text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] transition shrink-0 ml-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Active Tab Panel Content */}
              <div className="flex-1 overflow-hidden bg-[#07090A]">
                {sidePanelTab === "ai" && (
                  <AiPanel
                    code={code}
                    language={language}
                    output={output}
                    input={input}
                    onApplyCode={(newCode) => {
                      handleCodeChange(newCode, { line: 1, summary: "Applied AI code" });
                    }}
                    initialTab={aiInitialTab}
                    explainTrigger={explainTrigger}
                  />
                )}

                {sidePanelTab === "debug" && (
                  <CollaborativeDebugPanel
                    errorAttribution={errorAttribution}
                    hypotheses={hypotheses}
                    onAddHypothesis={handleAddHypothesis}
                    onUpdateHypothesis={handleUpdateHypothesis}
                    currentUserId={currentUser.id}
                    currentUserName={currentUser.name}
                    currentUserColor={currentUser.color}
                    sharedBreakpoints={sharedBreakpoints}
                    onToggleBreakpoint={handleToggleBreakpoint}
                  />
                )}

                {sidePanelTab === "chat" && (
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUser={currentUser}
                  />
                )}

                {sidePanelTab === "activity" && <ActivityLogPanel logs={activityLogs} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Learning Progress Modal */}
      {isProgressModalOpen && (
        <LearnerProgressModal
          progress={studentProgress}
          onClose={() => setIsProgressModalOpen(false)}
        />
      )}

      {/* Room Modal */}
      {modalMode && (
        <RoomModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          currentUserName={currentUser.name}
        />
      )}
    </div>
  );
}
