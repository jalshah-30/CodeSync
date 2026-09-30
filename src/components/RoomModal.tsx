import React, { useState } from "react";
import { X, Plus, LogIn, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#17191A] border border-[#1E2021] rounded-2xl shadow-2xl overflow-hidden text-[#FFFFFF] font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1E2021] bg-[#121416] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0DCC5C] text-[#03110A] flex items-center justify-center shadow-xs">
              {mode === "create" ? <Plus className="w-5 h-5 text-[#03110A]" /> : <LogIn className="w-5 h-5 text-[#03110A]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">
                {mode === "create" ? "Create Workspace" : "Join Workspace"}
              </h3>
              <p className="text-xs text-[#7F867F]">
                {mode === "create"
                  ? "Start a new collaborative session"
                  : "Enter a Room ID to collaborate in real-time"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* User Name */}
          <div>
            <label className="block text-[#FFFFFF] font-semibold mb-1.5">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Jal Shah"
              className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#292C2D] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition placeholder:text-[#7F867F] shadow-xs"
              required
            />
          </div>

          {mode === "create" ? (
            <>
              {/* Room Name */}
              <div>
                <label className="block text-[#FFFFFF] font-semibold mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Physics & Code Studio"
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#292C2D] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition placeholder:text-[#7F867F] shadow-xs"
                  required
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-[#FFFFFF] font-semibold mb-1.5">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#292C2D] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition shadow-xs"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-[#202224] text-[#FFFFFF]">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Room ID for Join */
            <div>
              <label className="block text-[#FFFFFF] font-semibold mb-1.5">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. ABC123 or algo-squad"
                className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#292C2D] rounded-xl font-mono text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition placeholder:text-[#7F867F] shadow-xs"
                required
              />
            </div>
          )}

          {/* Optional Password */}
          <div>
            <label className="block text-[#FFFFFF] font-semibold mb-1.5">
              Room Password <span className="text-[#7F867F] font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for public room"
              className="w-full px-3.5 py-2.5 bg-[#202224] border border-[#292C2D] rounded-xl text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition placeholder:text-[#7F867F] shadow-xs"
            />
          </div>

          {/* Submit Pill Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#0DCC5C] hover:bg-[#0BB652] text-[#03110A] font-semibold text-xs shadow-md transition active:scale-95"
          >
            {mode === "create" ? "Create Workspace" : "Join Workspace"}
          </button>
        </form>

        {/* Quick Demo Rooms Bar */}
        <div className="px-6 py-4 border-t border-[#1E2021] bg-[#121416] text-xs">
          <span className="text-[#7F867F] font-semibold block mb-2">Or jump into a demo room:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickJoin("hackconquest", "123")}
              className="p-2.5 rounded-xl bg-[#202224] hover:bg-[#292C2D] border border-[#292C2D] text-left transition flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="font-bold text-[#FFFFFF] block text-[11px]">HackConquest 2026</span>
                <span className="text-[10px] text-[#0DCC5C] font-mono">ID: hackconquest</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#7F867F]" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickJoin("algo-squad", "")}
              className="p-2.5 rounded-xl bg-[#202224] hover:bg-[#292C2D] border border-[#292C2D] text-left transition flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="font-bold text-[#FFFFFF] block text-[11px]">Algorithm Squad</span>
                <span className="text-[10px] text-[#0DCC5C] font-mono">ID: algo-squad</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#7F867F]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
