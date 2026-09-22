import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot, User } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: { id: string; name: string; color: string };
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const insertAiMention = () => {
    setInputText((prev) => (prev ? `${prev} @AI ` : "@AI "));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-950/60 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Team Chat</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
            {messages.length}
          </span>
        </div>

        <button
          onClick={insertAiMention}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-[11px] font-medium transition"
          title="Mention @AI in chat"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Ask @AI</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isAi = msg.isAi || msg.senderId.includes("ai");

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {/* Sender info */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isAi ? (
                  <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center text-white">
                    <Bot className="w-2.5 h-2.5" />
                  </div>
                ) : (
                  <span
                    style={{ backgroundColor: msg.senderColor || "#38bdf8" }}
                    className="w-2 h-2 rounded-full inline-block"
                  />
                )}
                <span className={`font-semibold text-[11px] ${isAi ? "text-violet-400 font-bold" : "text-slate-300"}`}>
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed break-words text-xs ${
                  isAi
                    ? "bg-violet-950/40 border border-violet-800/40 text-violet-200"
                    : isMe
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-800 border border-slate-700/80 text-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type message or tag @AI..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-cyan-500 transition placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition active:scale-95 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
