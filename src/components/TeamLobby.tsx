import React, { useState, useEffect } from "react";
import {
  LogIn,
  Plus,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { SupportedLanguage, LineAuthor } from "../types";
import { SUPPORTED_LANGUAGES } from "../utils/constants";
import { BrandLogo } from "./landing/BrandLogo";

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
  initialTab?: "create" | "join";
  onBackToLanding?: () => void;
}

export const TeamLobby: React.FC<TeamLobbyProps> = ({
  onJoinSuccess,
  defaultUserName = "Jal Shah",
  initialRoomId = "",
  initialTab = "join",
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<"join" | "create">(
    initialRoomId ? "join" : initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Common user name
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("codesync_username") || defaultUserName || "Jal Shah";
  });

  // Join Room State
  const [joinRoomId, setJoinRoomId] = useState(initialRoomId || "ABC123");
  const [joinPassword, setJoinPassword] = useState("123");
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  // Create Room State
  const [createRoomName, setCreateRoomName] = useState("Team Alpha Sprint");
  const [createPassword, setCreatePassword] = useState("123");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createLanguage, setCreateLanguage] = useState<SupportedLanguage>("python");
  const [customRoomCode, setCustomRoomCode] = useState("");

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);

  // Fetch active rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data);
      }
    } catch (e) {
      console.error("Failed to fetch available rooms:", e);
    }
  };

  const handleSaveUserName = (val: string) => {
    setUserName(val);
    localStorage.setItem("codesync_username", val);
  };

  // Join Team Room Handler
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
      setErrorMsg("Please enter the Room ID (e.g. ABC123).");
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
        setErrorMsg(data.error || "Failed to join team room. Please check the code and password.");
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
      setErrorMsg("Network error connecting to CodeSync server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create Team Room Handler
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
      setErrorMsg("Please enter a Team / Room Name.");
      return;
    }
    if (!cleanPassword) {
      setErrorMsg("Please set a password for your team room so your teammates can join securely.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: cleanUser,
          roomName: cleanRoomName,
          password: cleanPassword,
          language: createLanguage,
          customRoomId: customRoomCode.trim() ? customRoomCode.trim().toUpperCase() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create team room.");
        setLoading(false);
        return;
      }

      onJoinSuccess({
        roomId: data.roomId,
        roomName: data.roomName,
        language: (data.language as SupportedLanguage) || createLanguage,
        code: data.code,
        hasPassword: true,
        userName: cleanUser,
        lineAuthors: data.lineAuthors,
      });
    } catch (err: any) {
      setErrorMsg("Network error creating team room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillRoom = (room: AvailableRoom, defaultPass: string = "123") => {
    setJoinRoomId(room.id);
    setJoinPassword(defaultPass);
    setActiveTab("join");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-ink text-cream flex flex-col items-center justify-between p-4 sm:p-6 lg:p-10 selection:bg-royal selection:text-cream">
      {/* Top Header */}
      <header className="w-full max-w-xl flex items-center justify-between py-4 mb-4 border-b border-royal/30">
        <div className="flex items-center gap-3">
          {onBackToLanding ? (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 hover:opacity-80 transition group"
              title="Return to Overview"
            >
              <ArrowLeft className="w-4 h-4 text-cream/70 group-hover:-translate-x-0.5 transition-transform" />
              <BrandLogo size="md" />
            </button>
          ) : (
            <BrandLogo size="md" />
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-cream/60">
          <ShieldCheck className="w-4 h-4 text-cream/70" />
          <span>Encrypted sessions</span>
        </div>
      </header>

      {/* Main Focused Card on Surface */}
      <main className="w-full max-w-xl bg-surface border border-royal/40 rounded-[20px] p-6 sm:p-8 shadow-2xl">
        {/* Two Underline Tabs */}
        <div className="flex items-center gap-6 border-b border-royal/30 mb-6 pb-2">
          <button
            onClick={() => {
              setActiveTab("join");
              setErrorMsg(null);
            }}
            className={`relative pb-3 text-sm sm:text-base font-semibold transition cursor-pointer ${
              activeTab === "join" ? "text-cream" : "text-cream/60 hover:text-cream"
            }`}
          >
            <span>Join a room</span>
            {activeTab === "join" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cream rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("create");
              setErrorMsg(null);
            }}
            className={`relative pb-3 text-sm sm:text-base font-semibold transition cursor-pointer ${
              activeTab === "create" ? "text-cream" : "text-cream/60 hover:text-cream"
            }`}
          >
            <span>Create a room</span>
            {activeTab === "create" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cream rounded-full" />
            )}
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-[12px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: JOIN ROOM */}
        {activeTab === "join" && (
          <form onSubmit={handleJoin} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-cream/90 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => handleSaveUserName(e.target.value)}
                placeholder="e.g. Jal Shah"
                className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                required
              />
            </div>

            {/* Room ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-cream/90">
                  Room code
                </label>
                <span className="text-xs font-mono text-cream/60">
                  Demo code: <strong className="text-cream">ABC123</strong>
                </span>
              </div>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] font-mono uppercase tracking-wider text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-cream/90">
                  Room password
                </label>
                <span className="text-xs text-cream/60">
                  Demo password: <span className="font-mono text-cream">123</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showJoinPassword ? "text" : "password"}
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Enter room password"
                  className="w-full pl-4 pr-11 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                />
                <button
                  type="button"
                  onClick={() => setShowJoinPassword(!showJoinPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream transition"
                >
                  {showJoinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-cream text-ink font-semibold text-sm sm:text-base hover:bg-cream/90 active:scale-98 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <span>Join room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CREATE ROOM */}
        {activeTab === "create" && (
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Host Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-cream/90 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => handleSaveUserName(e.target.value)}
                placeholder="e.g. Jal Shah"
                className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                required
              />
            </div>

            {/* Room Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-cream/90 mb-1.5">
                Team or room name
              </label>
              <input
                type="text"
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                placeholder="e.g. Team Alpha Sprint"
                className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                required
              />
            </div>

            {/* Create Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-cream/90 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cream/70" />
                  <span>Set room password</span>
                </label>
                <span className="text-xs text-cream/60">Required for teammates</span>
              </div>
              <div className="relative">
                <input
                  type={showCreatePassword ? "text" : "password"}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Set a password (e.g. 123)"
                  className="w-full pl-4 pr-11 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm sm:text-base outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream transition"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Starter Language & Optional Room Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-cream/90 mb-1.5">
                  Starter language
                </label>
                <select
                  value={createLanguage}
                  onChange={(e) => setCreateLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] text-cream text-sm outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-ink text-cream">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-cream/90 mb-1.5">
                  Custom code <span className="text-cream/50 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customRoomCode}
                  onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TEAM42"
                  className="w-full px-4 py-3 bg-ink border border-royal/50 rounded-[12px] font-mono uppercase text-cream text-sm outline-none focus:ring-2 focus:ring-cream/40 focus:border-cream transition"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-cream text-ink font-semibold text-sm sm:text-base hover:bg-cream/90 active:scale-98 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating room...</span>
                ) : (
                  <>
                    <span>Create room and open editor</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Available Rooms Section */}
        <div className="mt-8 pt-6 border-t border-royal/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-cream/80 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cream/70" />
              <span>Demo and active rooms</span>
            </span>
            <button
              onClick={fetchRooms}
              className="text-xs text-cream/60 hover:text-cream transition underline underline-offset-4"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Demo Room 1: ABC123 */}
            <div
              onClick={() =>
                handleQuickFillRoom(
                  {
                    id: "ABC123",
                    name: "Team Alpha (Flowchart Demo)",
                    hasPassword: true,
                    language: "python",
                    memberCount: 3,
                  },
                  "123"
                )
              }
              className="group p-3 rounded-[12px] bg-ink border border-royal/40 hover:border-cream/60 cursor-pointer transition flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-bold text-cream">ABC123</span>
                  <Lock className="w-3 h-3 text-cream/60" />
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-royal/40 text-cream/70 uppercase">
                    python
                  </span>
                </div>
                <p className="text-xs text-cream/70 truncate mt-0.5">
                  Team Alpha (Flowchart Demo)
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-royal text-cream group-hover:bg-cream group-hover:text-ink transition shrink-0">
                Quick join
              </span>
            </div>

            {/* Demo Room 2: HACKCONQUEST */}
            <div
              onClick={() =>
                handleQuickFillRoom(
                  {
                    id: "hackconquest",
                    name: "HackConquest 2026 CodeSync Demo",
                    hasPassword: true,
                    language: "python",
                    memberCount: 4,
                  },
                  "123"
                )
              }
              className="group p-3 rounded-[12px] bg-ink border border-royal/40 hover:border-cream/60 cursor-pointer transition flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-bold text-cream">HACKCONQUEST</span>
                  <Lock className="w-3 h-3 text-cream/60" />
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-royal/40 text-cream/70 uppercase">
                    python
                  </span>
                </div>
                <p className="text-xs text-cream/70 truncate mt-0.5">
                  HackConquest Demo
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-royal text-cream group-hover:bg-cream group-hover:text-ink transition shrink-0">
                Quick join
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-xl text-center text-xs text-cream/40 mt-6 pb-2">
        Built at GCET • SoftDecoders
      </footer>
    </div>
  );
};
