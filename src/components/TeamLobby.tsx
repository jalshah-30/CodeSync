import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  LogIn,
  Lock,
  Code2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Radio,
  FileCode2,
  Terminal,
  Activity,
  Mic,
  MousePointer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { SupportedLanguage, LineAuthor } from "../types";
import { SUPPORTED_LANGUAGES } from "../utils/constants";

export interface AvailableRoom {
  id: string;
  name: string;
  hasPassword: boolean;
  language: string;
  memberCount: number;
}

interface TeamLobbyProps {
  onJoinSuccess: (roomData: {
    roomId: string;
    roomName: string;
    language: SupportedLanguage;
    code: string;
    hasPassword: boolean;
    userName: string;
    lineAuthors?: Record<number, LineAuthor>;
  }) => void;
  defaultUserName?: string;
  initialRoomId?: string;
}

export const TeamLobby: React.FC<TeamLobbyProps> = ({
  onJoinSuccess,
  defaultUserName = "Jal Shah",
  initialRoomId = "",
}) => {
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("codesync_username") || defaultUserName || "Jal Shah";
  });

  const [joinRoomId, setJoinRoomId] = useState(initialRoomId || "ABC123");
  const [joinPassword, setJoinPassword] = useState("123");
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  const [createRoomName, setCreateRoomName] = useState("Physics & Code Studio");
  const [createPassword, setCreatePassword] = useState("123");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createLanguage, setCreateLanguage] = useState<SupportedLanguage>("python");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveUserName = (val: string) => {
    setUserName(val);
    localStorage.setItem("codesync_username", val);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = userName.trim();
    const cleanRoom = joinRoomId.trim().toUpperCase();

    if (!cleanUser) {
      setErrorMsg("Please enter your name before joining.");
      return;
    }
    if (!cleanRoom) {
      setErrorMsg("Please enter the Room ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/joinRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: cleanRoom,
          userName: cleanUser,
          password: joinPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to join team room.");
        setLoading(false);
        return;
      }

      onJoinSuccess({
        roomId: data.roomId,
        roomName: data.roomName,
        language: (data.language as SupportedLanguage) || "python",
        code: data.code,
        hasPassword: !!data.hasPassword,
        userName: cleanUser,
        lineAuthors: data.lineAuthors,
      });
    } catch (err: any) {
      setErrorMsg("Network error connecting to CodeSync server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = userName.trim();
    const cleanRoomName = createRoomName.trim();
    const cleanPassword = createPassword.trim();

    if (!cleanUser) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!cleanRoomName) {
      setErrorMsg("Please enter a room name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: cleanRoomName,
          userName: cleanUser,
          password: cleanPassword,
          language: createLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create room.");
        setLoading(false);
        return;
      }

      onJoinSuccess({
        roomId: data.roomId,
        roomName: data.roomName,
        language: createLanguage,
        code: data.code,
        hasPassword: !!cleanPassword,
        userName: cleanUser,
        lineAuthors: data.lineAuthors,
      });
    } catch (err: any) {
      setErrorMsg("Network error creating room.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillRoom = (codeStr: string) => {
    setJoinRoomId(codeStr);
    setJoinPassword("123");
    setActiveTab("join");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans hero-radial-glow">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 mb-8 border-b border-[#1E2021]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#202224] border border-[#1E2021] text-[#0DCC5C] flex items-center justify-center shadow-md">
            <Code2 className="w-6 h-6 text-[#0DCC5C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#FFFFFF]">
                Code<span className="text-[#7F867F]">Sync</span>
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] border border-[#1E2021] flex items-center gap-1.5">
                <Radio className="w-2.5 h-2.5 text-[#0DCC5C] animate-pulse" />
                Live Hub
              </span>
            </div>
            <p className="text-xs text-[#7F867F] font-medium">
              Collaborative STEM Code Editor & Video Classroom
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#7F867F] font-medium">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#202224] border border-[#1E2021] text-[#0DCC5C]">
            <Sparkles className="w-3.5 h-3.5 text-[#0DCC5C]" />
            <span>AI Tutor & Real-Time Sync</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-5xl text-center mb-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#202224] border border-[#1E2021] text-xs font-medium text-[#7F867F] mb-4">
          <Zap className="w-3.5 h-3.5 text-[#0DCC5C]" />
          <span>Real-time Multi-User Coding Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#FFFFFF] tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
          Access the future of collaborative code
        </h1>
        <p className="text-sm sm:text-base text-[#7F867F] max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
          Experience AI-driven features: intelligent syntax debugging, integrated video classroom, live multi-user editing, and real-time execution.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab("join")}
            className="btn-accent px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <span>Join Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className="btn-secondary px-6 py-2.5 text-xs sm:text-sm font-medium"
          >
            Create New Room
          </button>
        </div>
      </div>

      {/* Index Bento Grid Showcase */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Bento Tile 1: Green Feature Gradient Card */}
        <div className="feature-card-green p-6 rounded-[24px] flex flex-col justify-between min-h-[180px] shadow-lg">
          <div className="inline-block self-start px-2.5 py-1 rounded-full bg-black/30 border border-white/10 text-[11px] font-medium text-white">
            Scalability
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5 leading-snug">
              Build Scalable Code with AI
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              Automated syntax error explainer, code quality analysis, and real-time execution.
            </p>
          </div>
        </div>

        {/* Bento Tile 2: Dark Bar Chart Card */}
        <div className="panel-card p-6 rounded-[24px] flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="text-xs font-semibold text-[#7F867F] mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#0DCC5C]" />
              Execution Efficiency
            </div>
            {/* Green Bar Chart Graphic Motif */}
            <div className="flex items-end gap-1.5 h-14 mb-3">
              {[40, 65, 30, 85, 50, 95, 70, 100, 60, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#0DCC5C] rounded-t-sm"
                  style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#FFFFFF]">90%</span>
            <span className="text-xs text-[#7F867F] font-medium">faster debugging cycles</span>
          </div>
        </div>

        {/* Bento Tile 3: Dark Stat Card */}
        <div className="panel-card p-6 rounded-[24px] flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7F867F] uppercase tracking-wider">
              Live Team Room
            </span>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0DCC5C] text-[#03110A] font-bold text-[11px] flex items-center justify-center border border-[#17191A]">
                J
              </div>
              <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white font-bold text-[11px] flex items-center justify-center border border-[#17191A]">
                S
              </div>
              <div className="w-7 h-7 rounded-full bg-[#ec4899] text-white font-bold text-[11px] flex items-center justify-center border border-[#17191A]">
                A
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#0DCC5C]" />
              <span className="text-xs font-semibold text-[#FFFFFF]">Sync Completed</span>
            </div>
            <p className="text-xs text-[#7F867F] font-normal leading-relaxed">
              Multi-user cursor tracking with audio/video room capability.
            </p>
          </div>
        </div>
      </div>

      {/* Main Room Form Box */}
      <div className="w-full max-w-xl panel-card overflow-hidden shadow-2xl mb-12">
        <div className="grid grid-cols-2 p-1.5 bg-[#121416] border-b border-[#1E2021]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("join");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "join"
                ? "bg-[#0D6430] text-[#0DCC5C] border border-[#0DCC5C]/30 shadow-xs"
                : "text-[#7F867F] hover:text-[#FFFFFF]"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Join Room</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "create"
                ? "bg-[#0D6430] text-[#0DCC5C] border border-[#0DCC5C]/30 shadow-xs"
                : "text-[#7F867F] hover:text-[#FFFFFF]"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Room</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "join" && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#FFFFFF]">Join Team Room</h2>
                <p className="text-xs text-[#7F867F] mt-0.5 font-normal">
                  Enter Room Code and Password to collaborate live.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => handleSaveUserName(e.target.value)}
                  placeholder="e.g. Jal Shah"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Room Code</label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl font-mono uppercase text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Room Password</label>
                <div className="relative">
                  <input
                    type={showJoinPassword ? "text" : "password"}
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJoinPassword(!showJoinPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F867F] hover:text-[#FFFFFF]"
                  >
                    {showJoinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-accent w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? "Connecting..." : "Join Room"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {activeTab === "create" && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#FFFFFF]">Create Team Room</h2>
                <p className="text-xs text-[#7F867F] mt-0.5 font-normal">
                  Start a new shared workspace for your team.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => handleSaveUserName(e.target.value)}
                  placeholder="e.g. Jal Shah"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={createRoomName}
                  onChange={(e) => setCreateRoomName(e.target.value)}
                  placeholder="e.g. Physics & Code Studio"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Set Password</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Enter password (e.g. 123)"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFFFFF] mb-1.5">Primary Language</label>
                <select
                  value={createLanguage}
                  onChange={(e) => setCreateLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-[#17191A] text-[#FFFFFF]">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-accent w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? "Creating..." : "Create Room"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Join Demo Bar */}
        <div className="p-4 bg-[#121416] border-t border-[#1E2021]">
          <span className="text-xs font-semibold text-[#7F867F] block mb-2">Quick Demo Rooms:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFillRoom("ABC123")}
              className="p-2.5 rounded-xl bg-[#070908] hover:bg-[#17191A] border border-[#1E2021] text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#FFFFFF] block text-xs">ABC123</span>
                <span className="text-[10px] text-[#7F867F] font-mono">Pass: 123</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#0DCC5C]" />
            </button>

            <button
              onClick={() => handleQuickFillRoom("hackconquest")}
              className="p-2.5 rounded-xl bg-[#070908] hover:bg-[#17191A] border border-[#1E2021] text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#FFFFFF] block text-xs">HACKCONQUEST</span>
                <span className="text-[10px] text-[#7F867F] font-mono">Pass: 123</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#0DCC5C]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
