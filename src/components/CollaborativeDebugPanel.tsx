import React, { useState } from "react";
import {
  Lightbulb,
  CheckCircle2,
  ThumbsUp,
  Plus,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { DebuggingHypothesis, ErrorAttribution } from "../types";

interface CollaborativeDebugPanelProps {
  errorAttribution: ErrorAttribution | null;
  hypotheses: DebuggingHypothesis[];
  onAddHypothesis: (text: string, lineTarget?: number) => void;
  onUpdateHypothesis: (id: string, status: "investigating" | "confirmed" | "resolved" | "dismissed", upvotes: string[]) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  sharedBreakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
}

export const CollaborativeDebugPanel: React.FC<CollaborativeDebugPanelProps> = ({
  errorAttribution,
  hypotheses,
  onAddHypothesis,
  onUpdateHypothesis,
  currentUserId,
  currentUserName,
  currentUserColor,
  sharedBreakpoints = [],
  onToggleBreakpoint,
}) => {
  const [newHypothesisText, setNewHypothesisText] = useState("");
  const [targetLine, setTargetLine] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHypothesisText.trim()) return;
    const lineNum = targetLine ? parseInt(targetLine, 10) : undefined;
    onAddHypothesis(newHypothesisText.trim(), isNaN(lineNum as number) ? undefined : lineNum);
    setNewHypothesisText("");
    setTargetLine("");
  };

  const handleVote = (hypo: DebuggingHypothesis) => {
    const hasVoted = hypo.upvotedBy.includes(currentUserId);
    const updated = hasVoted
      ? hypo.upvotedBy.filter((id) => id !== currentUserId)
      : [...hypo.upvotedBy, currentUserId];

    onUpdateHypothesis(hypo.id, hypo.status, updated);
  };

  const handleStatusChange = (hypo: DebuggingHypothesis, newStatus: "investigating" | "confirmed" | "resolved" | "dismissed") => {
    onUpdateHypothesis(hypo.id, newStatus, hypo.upvotedBy);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090A] text-[#FFFFFF] text-xs p-3.5 overflow-y-auto">
      {/* 1. Error Attribution Card */}
      {errorAttribution ? (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-3.5 mb-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Active Execution Fault</span>
            </span>
            {errorAttribution.line && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-900/80 text-rose-200 font-mono text-[10px] font-bold border border-rose-700/50">
                Line {errorAttribution.line}
              </span>
            )}
          </div>

          <p className="text-rose-100 font-mono text-xs bg-[#07090A]/80 p-2.5 rounded-xl border border-rose-900/40 mb-2 truncate">
            {errorAttribution.errorMessage}
          </p>

          <div className="flex items-center justify-between text-[11px] text-rose-300 font-medium">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-white"
                style={{ backgroundColor: errorAttribution.authorColor }}
              />
              <span>
                Authored by <strong>{errorAttribution.authorName}</strong>
              </span>
            </div>
            <span>{new Date(errorAttribution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1E2021] bg-[#17191A] p-3.5 mb-3.5 flex items-center gap-2.5 text-[#7F867F] font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#0DCC5C] shrink-0" />
          <span>No runtime exceptions active. Execution nominal.</span>
        </div>
      )}

      {/* 2. Collaborative Breakpoints */}
      <div className="rounded-2xl border border-[#1E2021] bg-[#17191A] p-3.5 mb-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#FFFFFF] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0DCC5C]" />
            <span>Shared Breakpoints ({sharedBreakpoints.length})</span>
          </span>
          <span className="text-[10px] text-[#7F867F] font-medium">Synchronized</span>
        </div>

        {sharedBreakpoints.length === 0 ? (
          <p className="text-xs text-[#7F867F]">
            Click line numbers in editor to drop collaborative team breakpoints.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sharedBreakpoints.map((line) => (
              <span
                key={line}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#202224] border border-[#292C2D] text-xs font-mono font-semibold text-[#0DCC5C] shadow-xs"
              >
                <span>Line {line}</span>
                {onToggleBreakpoint && (
                  <button
                    onClick={() => onToggleBreakpoint(line)}
                    className="hover:text-rose-400 font-bold ml-1"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Hypothesis Board Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#FFFFFF]">
          <Lightbulb className="w-4 h-4 text-[#0DCC5C]" />
          <span>Bug Hypothesis Board</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[10px] font-bold text-[#0DCC5C] border border-[#292C2D]">
          {hypotheses.length} Ideas
        </span>
      </div>

      {/* Post New Hypothesis Form */}
      <form onSubmit={handleSubmit} className="mb-3.5">
        <div className="rounded-2xl border border-[#1E2021] bg-[#17191A] p-3 flex flex-col gap-2 shadow-xs">
          <textarea
            value={newHypothesisText}
            onChange={(e) => setNewHypothesisText(e.target.value)}
            placeholder="Hypothesize why the bug occurred (e.g. 'Division by zero on empty array')..."
            rows={2}
            className="w-full bg-transparent text-xs text-[#FFFFFF] placeholder-[#7F867F] resize-none outline-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#292C2D]">
            <input
              type="number"
              value={targetLine}
              onChange={(e) => setTargetLine(e.target.value)}
              placeholder="Line (opt)"
              className="w-24 px-2.5 py-1 rounded-full bg-[#202224] border border-[#292C2D] text-xs text-[#FFFFFF] placeholder-[#7F867F] outline-none focus:border-[#0DCC5C]"
            />
            <button
              type="submit"
              disabled={!newHypothesisText.trim()}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#0DCC5C] text-[#03110A] hover:bg-[#0BB652] text-xs font-semibold disabled:opacity-40 transition active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#03110A]" />
              <span>Post Idea</span>
            </button>
          </div>
        </div>
      </form>

      {/* Hypotheses List */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
        {hypotheses.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-[#292C2D] text-center text-[#7F867F]">
            <p className="text-xs font-medium">No hypotheses posted yet.</p>
            <p className="text-[11px] text-[#7F867F] mt-1">
              Brainstorm and test bug fix hypotheses with your team!
            </p>
          </div>
        ) : (
          hypotheses.map((hypo) => {
            const hasVoted = hypo.upvotedBy.includes(currentUserId);
            return (
              <div
                key={hypo.id}
                className="p-3.5 rounded-2xl border border-[#1E2021] bg-[#17191A] shadow-xs transition hover:border-[#292C2D]"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-[#292C2D]"
                      style={{ backgroundColor: hypo.authorColor }}
                    />
                    <span className="font-bold text-[#FFFFFF] text-xs">{hypo.authorName}</span>
                    {hypo.lineTarget && (
                      <span className="px-2 py-0.5 rounded-full bg-[#202224] text-[10px] font-mono font-semibold text-[#0DCC5C]">
                        L:{hypo.lineTarget}
                      </span>
                    )}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[10px] uppercase font-bold text-[#0DCC5C] border border-[#292C2D]">
                    {hypo.status}
                  </span>
                </div>

                <p className="text-xs text-[#FFFFFF] mb-2.5 leading-relaxed font-medium">{hypo.text}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#292C2D] text-xs">
                  <button
                    onClick={() => handleVote(hypo)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition text-xs font-semibold ${
                      hasVoted
                        ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
                        : "bg-[#202224] text-[#FFFFFF] hover:bg-[#292C2D] border border-[#292C2D]"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{hypo.upvotes || 0}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStatusChange(hypo, "confirmed")}
                      className="px-2.5 py-1 rounded-full bg-[#202224] hover:bg-[#292C2D] border border-[#0DCC5C]/40 text-[#0DCC5C] text-[10px] font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(hypo, "resolved")}
                      className="px-2.5 py-1 rounded-full bg-[#17191A] border border-[#292C2D] text-[#7F867F] hover:text-[#FFFFFF] text-[10px] font-medium"
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
