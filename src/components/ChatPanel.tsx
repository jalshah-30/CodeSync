import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot } from "lucide-react";
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
    <div className="flex flex-col h-full bg-[#17191A] border-0 text-xs text-[#FFFFFF]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2021] bg-[#121416] select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0DCC5C]" />
          <span className="font-bold text-[#FFFFFF] text-xs">Team Chat</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[10px] font-bold text-[#0DCC5C] border border-[#1E2021]">
            {messages.length}
          </span>
        </div>

        <button
          onClick={insertAiMention}
          className="btn-accent flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shadow-xs"
          title="Mention @AI in chat"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#03110A]" />
          <span>Ask @AI</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#07090A]">
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
                  <div className="w-4 h-4 rounded-full bg-[#0DCC5C] text-[#03110A] flex items-center justify-center font-bold text-[10px]">
                    <Bot className="w-2.5 h-2.5 text-[#03110A]" />
                  </div>
                ) : (
                  <span
                    style={{ backgroundColor: msg.senderColor || "#333333" }}
                    className="w-2.5 h-2.5 rounded-full inline-block border border-[#000000]"
                  />
                )}
                <span className="font-bold text-xs text-[#FFFFFF]">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-[#7F867F]">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3 leading-relaxed break-words text-xs shadow-xs font-medium ${
                  isAi
                    ? "bg-[#202224] border border-[#0DCC5C]/30 text-[#0DCC5C] rounded-tl-xs"
                    : isMe
                    ? "bg-[#0D6430] border border-[#0DCC5C]/30 text-[#FFFFFF] rounded-tr-xs"
                    : "bg-[#17191A] border border-[#1E2021] text-[#FFFFFF] rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-[#1E2021] bg-[#121416]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type message or @AI to prompt assistant..."
            className="flex-1 px-3.5 py-2.5 bg-[#202224] border border-[#1E2021] rounded-full text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] transition placeholder-[#7F867F]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="btn-accent p-2.5 text-[#03110A] disabled:opacity-40 transition active:scale-95 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
