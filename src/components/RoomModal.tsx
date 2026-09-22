import React, { useState } from "react";
import { X, Plus, LogIn, Key, Sparkles, Code2, Users, ArrowRight } from "lucide-react";
import { SupportedLanguage } from "../types";
import { SUPPORTED_LANGUAGES } from "../utils/constants";

interface RoomModalProps {
  mode: "create" | "join";
  onClose: () => void;
  onCreateRoom: (roomName: string, userName: string, password?: string, language?: SupportedLanguage) => void;
  onJoinRoom: (roomId: string, userName: string, password?: string) => void;
  currentUserName: string;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  mode,
  onClose,
  onCreateRoom,
  onJoinRoom,
  currentUserName,
}) => {
  const [userName, setUserName] = useState(currentUserName || "Jal Shah");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!userName.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    if (mode === "create") {
      if (!roomName.trim()) {
        setErrorMsg("Please enter a room name");
        return;
      }
      onCreateRoom(roomName.trim(), userName.trim(), password.trim() || undefined, language);
    } else {
      if (!roomId.trim()) {
        setErrorMsg("Please enter a Room ID");
        return;
      }
      onJoinRoom(roomId.trim(), userName.trim(), password.trim() || undefined);
    }
  };

  const handleQuickJoin = (quickId: string, quickPass: string = "") => {
    onJoinRoom(quickId, userName.trim() || "Guest", quickPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white">
              {mode === "create" ? <Plus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === "create" ? "Create CodeSync Room" : "Join CodeSync Room"}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === "create"
                  ? "Start a new collaborative coding session"
                  : "Enter a Room ID to collaborate in real-time"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* User Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Jal Shah"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          {mode === "create" ? (
            <>
              {/* Room Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Team SoftDecoders Sprint"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-cyan-500 transition"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Room ID for Join */
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. cs-8f3b21 or hackconquest"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 text-xs outline-none focus:border-cyan-500 transition"
                required
              />
            </div>
          )}

          {/* Optional Password */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Room Password <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for public room"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition active:scale-95"
          >
            {mode === "create" ? "Create Workspace" : "Join Workspace"}
          </button>
        </form>

        {/* Quick Demo Rooms Bar */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <span className="text-slate-400 font-medium block mb-2">Or jump into a demo room:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickJoin("hackconquest", "123")}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-cyan-400 block text-[11px]">HackConquest 2026</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: hackconquest</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickJoin("algo-squad", "")}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-emerald-400 block text-[11px]">Algorithm Squad</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: algo-squad</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
