import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import confetti from "canvas-confetti";
import {
  Sparkles,
  MessageSquare,
  Activity,
  ChevronRight,
  ChevronLeft,
  Users,
  Code2,
  Terminal,
  Bot,
  UserPlus,
} from "lucide-react";
import {
  Collaborator,
  SupportedLanguage,
  EditorTheme,
  ChatMessage,
  ActivityLog,
  ExecutionResult,
  LineAuthor,
  ErrorAttribution,
} from "./types";
import {
  generateInitialLineAuthors,
  updateLineAuthors,
  parseErrorAttribution,
} from "./utils/authorship";
import {
  SUPPORTED_LANGUAGES,
  STARTER_TEMPLATES,
  COLLABORATOR_COLORS,
} from "./utils/constants";
import { Navbar } from "./components/Navbar";
import { CodeEditor } from "./components/CodeEditor";
import { TerminalPanel } from "./components/TerminalPanel";
import { VoiceRoomBar } from "./components/VoiceRoomBar";
import { AiPanel } from "./components/AiPanel";
import { ChatPanel } from "./components/ChatPanel";
import { ActivityLogPanel } from "./components/ActivityLogPanel";
import { RoomModal } from "./components/RoomModal";
import { TeamLobby } from "./components/TeamLobby";
import { LandingPage } from "./components/landing/LandingPage";
import { VoiceManager, MicPermissionStatus } from "./utils/voiceManager";

export default function App() {
  // Pre-Editor Room Selection Gate (Do not directly start with editor)
  const [isInRoom, setIsInRoom] = useState<boolean>(false);
  const hasHashOnLoad = typeof window !== "undefined" && Boolean(window.location.hash.replace("#", ""));
  const [showLobby, setShowLobby] = useState<boolean>(hasHashOnLoad);
  const [lobbyInitialTab, setLobbyInitialTab] = useState<"create" | "join">("join");

  // Current User State: Each browser tab maintains an independent session ID & color
  // to ensure seamless real-time collaboration across multiple tabs in the same browser,
  // while remembering the preferred name in localStorage.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionSaved = sessionStorage.getItem("codesync_session_user");
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (parsed?.id && parsed?.name) return parsed;
      }
    } catch (e) {}

    const savedName = localStorage.getItem("codesync_username") || "Jal Shah";
    const randomColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
    const newUser = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      name: savedName,
      color: randomColor,
    };
    try {
      sessionStorage.setItem("codesync_session_user", JSON.stringify(newUser));
    } catch (e) {}
    return newUser;
  });

  // Current Room State
  const [roomId, setRoomId] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "ABC123";
  });
  const [roomName, setRoomName] = useState<string>("Team Alpha (Flowchart Demo)");
  const [hasPassword, setHasPassword] = useState<boolean>(false);

  // Editor State
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [theme, setTheme] = useState<EditorTheme>("vs-dark");
  const [fontSize, setFontSize] = useState<number>(15);
  const [code, setCode] = useState<string>(STARTER_TEMPLATES.python);
  const [lineAuthors, setLineAuthors] = useState<Record<number, LineAuthor>>(() =>
    generateInitialLineAuthors(STARTER_TEMPLATES.python, [], currentUser)
  );
  const [errorAttribution, setErrorAttribution] = useState<ErrorAttribution | null>(null);

  // Terminal State
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [executionTime, setExecutionTime] = useState<string>("0.00");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Voice & WebRTC State
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const isMutedRef = useRef<boolean>(true);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0);
  const [micStatus, setMicStatus] = useState<MicPermissionStatus>("idle");
  const [micError, setMicError] = useState<string>("");
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isLoopbackActive, setIsLoopbackActive] = useState<boolean>(false);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  // Collaborators, Chat, and Activity Logs
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Right Side Panel Tab
  const [sidePanelTab, setSidePanelTab] = useState<"ai" | "chat" | "activity" | "closed">("ai");
  const [aiInitialTab, setAiInitialTab] = useState<"explain" | "debug" | "review" | "generate" | "chat">("explain");
  const [explainTrigger, setExplainTrigger] = useState<number>(0);

  // Room Modal State
  const [modalMode, setModalMode] = useState<"create" | "join" | null>(null);

  // Socket Reference
  const socketRef = useRef<Socket | null>(null);

  // Save current user to sessionStorage & localStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("codesync_session_user", JSON.stringify(currentUser));
      localStorage.setItem("codesync_username", currentUser.name);
    } catch (e) {}
  }, [currentUser]);

  // Keep hash updated with Room ID only once in room
  useEffect(() => {
    if (isInRoom && roomId) {
      window.location.hash = roomId;
    }
  }, [isInRoom, roomId]);

  // Socket.IO Setup & Event Listeners (only connected once room is joined/created)
  useEffect(() => {
    if (!isInRoom) return;

    const socket = io({
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    // Initialize Voice & WebRTC Manager
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
    });
    voiceManagerRef.current = vm;

    // Join room
    socket.emit("join-room", {
      roomId,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        isMuted,
        isSpeaking: false,
        joinedAt: Date.now(),
      },
    });

    // Room state from server
    socket.on("room-state", (data) => {
      if (data.code !== undefined) setCode(data.code);
      if (data.language) setLanguage(data.language);
      if (data.roomName) setRoomName(data.roomName);
      if (data.input !== undefined) setInput(data.input);
      if (data.output !== undefined) setOutput(data.output);
      if (data.executionStatus) setExecutionStatus(data.executionStatus);
      if (data.executionTime) setExecutionTime(data.executionTime);
      if (data.messages) setMessages(data.messages);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.lineAuthors) {
        setLineAuthors(data.lineAuthors);
      } else if (data.code) {
        setLineAuthors(generateInitialLineAuthors(data.code, data.members || [], currentUser));
      }
      if (data.errorAttribution !== undefined) {
        setErrorAttribution(data.errorAttribution);
      }
      if (data.members) {
        // Merge members with our current user
        setCollaborators(data.members);
        data.members.forEach((m: Collaborator) => {
          if (m.socketId && m.socketId !== socket.id) {
            vm.connectToPeer(m.socketId, true);
          }
        });
      }
    });

    // Real-time code update from other collaborators
    socket.on("code-update", ({ code: remoteCode, senderSocketId, lineAuthors: remoteLineAuthors }) => {
      // If this socket itself sent the update, ignore (safeguard against echo)
      if (senderSocketId && socketRef.current && senderSocketId === socketRef.current.id) {
        return;
      }
      setCode(remoteCode);
      if (remoteLineAuthors) {
        setLineAuthors(remoteLineAuthors);
      }
    });

    // Collaborative cursor tracking
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
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            name: userName || updated[index].name,
            color: userColor || updated[index].color,
            cursor,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: trackerId,
              socketId: senderSocketId,
              name: userName,
              color: userColor,
              cursor,
            },
          ];
        }
      });
    });

    // Language update
    socket.on("language-update", ({ language: remoteLang }) => {
      setLanguage(remoteLang);
    });

    // Stdin update
    socket.on("stdin-update", ({ input: remoteInput }) => {
      setInput(remoteInput);
    });

    // Output & Execution update
    socket.on("output-update", ({ output: remoteOutput, status, executionTime, stderr, errorAttribution: remoteErrorAttribution }) => {
      setOutput(remoteOutput);
      setExecutionStatus(status);
      setExecutionTime(executionTime);
      setIsRunning(false);
      if (remoteErrorAttribution !== undefined) {
        setErrorAttribution(remoteErrorAttribution);
      }

      if (status === "success" && !stderr) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8 },
        });
      }
    });

    // Member list update & WebRTC peer mesh syncing
    socket.on("members-update", (members: Collaborator[]) => {
      setCollaborators(members);
      members.forEach((m) => {
        if (m.socketId && m.socketId !== socket.id) {
          vm.connectToPeer(m.socketId, true);
        }
      });
    });

    // WebRTC Voice mesh signal routing
    socket.on("webrtc-signal", ({ senderSocketId, signal }) => {
      vm.handleSignal(senderSocketId, signal);
    });

    // New chat message
    socket.on("new-message", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Activity log entry
    socket.on("activity-log", (log: ActivityLog) => {
      setActivityLogs((prev) => {
        if (prev.some((l) => l.id === log.id)) return prev;
        return [...prev, log];
      });
    });

    // User voice update
    socket.on("user-voice-update", ({ userId, senderSocketId, isMuted: remoteMuted, isSpeaking: remoteSpeaking }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          (c.id === userId || (senderSocketId && c.socketId === senderSocketId))
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
    };
  }, [isInRoom, roomId, currentUser.id, currentUser.name, currentUser.color]);

  // Handle Code Change
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

      // If user edits the line where the error occurred, clear obsolete error attribution
      if (errorAttribution?.line && changeDetails?.line === errorAttribution.line) {
        setErrorAttribution(null);
      }
    },
    [roomId, code, currentUser, errorAttribution]
  );

  // Handle Cursor Movement
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

  // Handle Language Change
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // If empty or default, set template
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

  // Handle Stdin (Input) Change
  const handleInputChange = (newInput: string) => {
    setInput(newInput);
    if (socketRef.current) {
      socketRef.current.emit("stdin-change", {
        roomId,
        input: newInput,
      });
    }
  };

  // Run Code Execution
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionStatus("running");
    setOutput("Running program on CodeSync sandbox...");
    setErrorAttribution(null);

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

      const data: ExecutionResult = await res.json();
      setOutput(data.output);
      setExecutionStatus(data.status);
      setExecutionTime(data.time);

      if (data.errorAttribution) {
        setErrorAttribution(data.errorAttribution);
      } else if (data.status === "error" || data.stderr) {
        const parsed = parseErrorAttribution(data.output, data.stderr, lineAuthors, currentUser);
        if (parsed) setErrorAttribution(parsed);
      } else {
        setErrorAttribution(null);
      }

      if (data.status === "success" && !data.stderr) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
        });
      }
    } catch (err: any) {
      setOutput(`Execution Error: ${err.message || "Failed to run program"}`);
      setExecutionStatus("error");
      const parsed = parseErrorAttribution(err.message, err.message, lineAuthors, currentUser);
      if (parsed) setErrorAttribution(parsed);
    } finally {
      setIsRunning(false);
    }
  };

  // Send Chat Message
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

  // Voice Mic Toggle
  const handleToggleMic = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (voiceManagerRef.current) {
      await voiceManagerRef.current.setMuted(nextMuted);
    }

    if (socketRef.current) {
      socketRef.current.emit("voice-state", {
        roomId,
        isMuted: nextMuted,
        isSpeaking: false,
      });
    }
  };

  // Toggle Deafen (Mute incoming voice mesh)
  const handleToggleDeafen = () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    if (voiceManagerRef.current) {
      voiceManagerRef.current.setDeafened(nextDeafened);
    }
  };

  // Toggle Self-Test Loopback (hear own mic in headphones)
  const handleToggleLoopback = () => {
    if (voiceManagerRef.current) {
      const active = voiceManagerRef.current.toggleSelfLoopback();
      setIsLoopbackActive(active);
    }
  };

  // Create Room Flow
  const handleCreateRoom = async (
    name: string,
    user: string,
    pass?: string,
    lang?: SupportedLanguage
  ) => {
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

  // Join Room Flow (from Modal)
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
      setLineAuthors(data.lineAuthors || generateInitialLineAuthors(data.code, [], updatedUser));
      setInput(data.input || "");
      setOutput(data.output || "");
      setExecutionStatus(data.executionStatus || "idle");
      setExecutionTime(data.executionTime || "0.00");
      setMessages(data.messages || []);
      setActivityLogs(data.activityLogs || []);
      if (data.errorAttribution) setErrorAttribution(data.errorAttribution);
      setHasPassword(!!pass);
      setIsInRoom(true);
      setModalMode(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Entrance Lobby Handlers
  const handleJoinSuccess = (data: {
    roomId: string;
    roomName: string;
    language: SupportedLanguage;
    code: string;
    hasPassword: boolean;
    userName: string;
    lineAuthors?: Record<number, LineAuthor>;
  }) => {
    const updatedUser = {
      ...currentUser,
      name: data.userName || currentUser.name,
    };
    setCurrentUser(updatedUser);
    try {
      sessionStorage.setItem("codesync_session_user", JSON.stringify(updatedUser));
      localStorage.setItem("codesync_username", data.userName);
    } catch (e) {}
    setRoomId(data.roomId);
    setRoomName(data.roomName);
    setLanguage(data.language);
    setCode(data.code);
    setLineAuthors(data.lineAuthors || generateInitialLineAuthors(data.code, [], updatedUser));
    setHasPassword(data.hasPassword);
    setIsInRoom(true);
    window.location.hash = data.roomId;
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsInRoom(false);
    setShowLobby(false);
    window.location.hash = "";
  };

  // AI Assistant Triggers
  const openAiExplain = () => {
    setSidePanelTab("ai");
    setAiInitialTab("explain");
    setExplainTrigger((prev) => prev + 1);
  };

  const openAiDebug = () => {
    setSidePanelTab("ai");
    setAiInitialTab("debug");
  };

  // Apply AI Generated/Fixed Code to Editor
  const handleApplyAiCode = (newCode: string) => {
    handleCodeChange(newCode, {
      line: 1,
      summary: "applied CodeSync AI patch to workspace",
    });
  };

  // If not currently in a room, show Landing Page or Lobby Gate
  if (!isInRoom) {
    if (!showLobby) {
      return (
        <LandingPage
          onOpenLobby={(tab) => {
            setLobbyInitialTab(tab);
            setShowLobby(true);
          }}
        />
      );
    }

    return (
      <TeamLobby
        onJoinSuccess={handleJoinSuccess}
        defaultUserName={currentUser.name}
        initialRoomId={window.location.hash.replace("#", "")}
        initialTab={lobbyInitialTab}
        onBackToLanding={() => setShowLobby(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* 1. Top Navbar */}
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
        onOpenAiAssistant={() => {
          setSidePanelTab("ai");
          setAiInitialTab("chat");
        }}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* 2. Voice Mesh Audio Bar */}
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
      />

      {/* 3. Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left / Center: Editor + Stdin/Stdout Terminal */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">
          {/* Top Half: Real-time Shared Code Editor */}
          <div className="flex-[6] min-h-[300px]">
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
              onAskAiToExplain={openAiExplain}
              isRunning={isRunning}
            />
          </div>

          {/* Bottom Half: Interactive Terminal & Execution Result */}
          <div className="flex-[4] min-h-[180px]">
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
              onAskAiToDebug={openAiDebug}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Right Sidebar: CodeSync AI / Team Chat / Activity Logs */}
        <div
          className={`flex flex-col h-full transition-all duration-200 ${
            sidePanelTab === "closed" ? "w-12" : "w-80 lg:w-96"
          }`}
        >
          {sidePanelTab === "closed" ? (
            /* Collapsed Dock */
            <div className="h-full rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex flex-col items-center gap-4">
              <button
                onClick={() => setSidePanelTab("ai")}
                title="Open CodeSync AI"
                className="p-2 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </button>
              <button
                onClick={() => setSidePanelTab("chat")}
                title="Open Team Chat"
                className="p-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-750 transition"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidePanelTab("activity")}
                title="Open Activity Log"
                className="p-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-750 transition"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded Multi-Tab Sidebar */
            <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-950/70 select-none text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSidePanelTab("ai")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      sidePanelTab === "ai"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Assistant</span>
                  </button>

                  <button
                    onClick={() => setSidePanelTab("chat")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      sidePanelTab === "chat"
                        ? "bg-slate-800 text-cyan-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setSidePanelTab("activity")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      sidePanelTab === "activity"
                        ? "bg-slate-800 text-emerald-400 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Activity</span>
                  </button>
                </div>

                <button
                  onClick={() => setSidePanelTab("closed")}
                  title="Collapse sidebar"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Panels */}
              <div className="flex-1 overflow-hidden">
                {sidePanelTab === "ai" && (
                  <AiPanel
                    code={code}
                    language={language}
                    output={output}
                    input={input}
                    onApplyCode={handleApplyAiCode}
                    initialTab={aiInitialTab}
                    explainTrigger={explainTrigger}
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

      {/* 4. Room Modal (Create or Join) */}
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
