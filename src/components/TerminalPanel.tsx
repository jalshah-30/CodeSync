import React, { useState } from "react";
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Send,
} from "lucide-react";
import { ErrorAttribution } from "../types";

interface TerminalPanelProps {
  input: string;
  onInputChange: (newInput: string) => void;
  output: string;
  onClearOutput: () => void;
  status: "idle" | "running" | "success" | "error";
  executionTime?: string;
  errorAttribution?: ErrorAttribution | null;
  onRunCode: () => void;
  onAskAiToDebug: () => void;
  isRunning?: boolean;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  input,
  onInputChange,
  output,
  onClearOutput,
  status,
  executionTime,
  errorAttribution,
  onRunCode,
  onAskAiToDebug,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");
  const [copied, setCopied] = useState(false);

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isError = status === "error" || output.toLowerCase().includes("error") || output.toLowerCase().includes("traceback");

  return (
    <div className="panel-card flex flex-col h-full rounded-2xl border border-[#1E2021] bg-[#17191A] shadow-md overflow-hidden text-[#FFFFFF] font-sans text-xs">
      {/* Light Card Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E2021] bg-[#121416] select-none">
        {/* Tabs: Output (stdout) vs Input (stdin) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition text-xs ${
              activeTab === "output"
                ? "bg-[#0D6430] text-[#0DCC5C] border border-[#0DCC5C]/30 font-semibold shadow-xs"
                : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] font-medium"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#0DCC5C]" />
            <span>Output (stdout)</span>
            {status === "success" && (
              <span className="w-2 h-2 rounded-full bg-[#0DCC5C] inline-block" />
            )}
            {status === "error" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("input")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition text-xs ${
              activeTab === "input"
                ? "bg-[#0D6430] text-[#0DCC5C] border border-[#0DCC5C]/30 font-semibold shadow-xs"
                : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] font-medium"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Input (stdin)</span>
            {input.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            )}
          </button>
        </div>

        {/* Status Chips & Actions */}
        <div className="flex items-center gap-2">
          {executionTime && (
            <div className="flex items-center gap-1 text-[11px] text-[#0DCC5C] bg-[#202224] px-2.5 py-0.5 rounded-full border border-[#1E2021] font-mono">
              <Clock className="w-3 h-3 text-[#7F867F]" />
              <span>{executionTime}s</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-1 text-[11px] text-[#0DCC5C] bg-[#0D6430]/30 px-2.5 py-0.5 rounded-full border border-[#0DCC5C]/30 font-semibold shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-[#0DCC5C]" />
              <span>Done (Exit 0)</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-1 text-[11px] text-rose-300 bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-500/40 font-semibold shadow-xs">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Error</span>
            </div>
          )}

          {/* AI Debug Chip Button */}
          {isError && (
            <button
              onClick={onAskAiToDebug}
              className="btn-accent flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold transition active:scale-95 shadow-xs"
              title="Fix this error automatically with AI"
            >
              <Sparkles className="w-3 h-3 text-[#03110A]" />
              <span>Debug with AI</span>
            </button>
          )}

          {/* Copy Output Button */}
          {output && activeTab === "output" && (
            <button
              onClick={handleCopyOutput}
              title="Copy Output"
              className="btn-secondary p-1.5 text-[#7F867F] hover:text-[#FFFFFF]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0DCC5C] font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Clear Output Button */}
          {output && activeTab === "output" && (
            <button
              onClick={onClearOutput}
              title="Clear Output"
              className="btn-secondary p-1.5 text-[#7F867F] hover:text-[#FFFFFF]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dark Console Terminal Execution Area */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed bg-[#07090A] text-[#FFFFFF]">
        {activeTab === "output" ? (
          <div>
            {isRunning ? (
              <div className="flex items-center gap-2 text-[#FFFFFF] animate-pulse py-4 font-sans text-xs">
                <div className="w-3 h-3 border-2 border-[#0DCC5C] border-t-transparent rounded-full animate-spin" />
                <span>Executing code in isolated environment...</span>
              </div>
            ) : output ? (
              <div className="space-y-2">
                {isError ? (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {errorAttribution ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm border border-white/20"
                            style={{ backgroundColor: errorAttribution.authorColor }}
                          >
                            {errorAttribution.authorName.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 flex-wrap font-sans">
                            <span className="text-xs font-bold text-rose-200">
                              Execution Error Detected
                            </span>
                            {errorAttribution && (
                              <>
                                <span className="text-xs text-rose-300/80">• Caused by:</span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                                  style={{ backgroundColor: errorAttribution.authorColor }}
                                >
                                  {errorAttribution.authorName}
                                </span>
                                {errorAttribution.line && (
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/60 border border-rose-500/40 text-rose-300 font-semibold">
                                    Line {errorAttribution.line}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-rose-200 font-mono mt-1">
                            {errorAttribution?.errorMessage || "Review the execution traceback below."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={onAskAiToDebug}
                        className="btn-accent px-3 py-1.5 text-xs font-sans font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#03110A]" />
                        <span>Auto-Fix</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#202224] border border-[#1E2021] text-[#FFFFFF] flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#FFFFFF]">
                      <CheckCircle2 className="w-4 h-4 text-[#0DCC5C]" />
                      <span>Program executed successfully</span>
                    </div>
                    <span className="text-[11px] text-[#7F867F]">
                      Synchronized with team
                    </span>
                  </div>
                )}

                <pre className="whitespace-pre-wrap break-words text-[#FFFFFF] bg-[#000000] p-3 rounded-xl border border-[#1E2021] font-mono text-xs">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#7F867F] text-center py-8 font-sans">
                <Terminal className="w-8 h-8 mb-2 opacity-40 text-[#7F867F]" />
                <p className="text-[#FFFFFF] font-medium text-xs">Ready for execution</p>
                <p className="text-[#7F867F] text-[11px] mt-1">
                  Press <kbd className="px-1.5 py-0.5 bg-[#202224] rounded text-[#FFFFFF] border border-[#1E2021] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#202224] rounded text-[#FFFFFF] border border-[#1E2021] font-mono">Enter</kbd> or click Run
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col font-sans">
            <label className="text-[11px] text-[#7F867F] mb-1 block">
              Standard Input (stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter standard input values (one per line)..."
              className="flex-1 w-full p-3 bg-[#202224] text-[#FFFFFF] border border-[#1E2021] rounded-xl resize-none outline-none focus:border-[#0DCC5C] font-mono text-xs placeholder-[#7F867F]"
            />
          </div>
        )}
      </div>

      {/* Terminal Card Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#1E2021] bg-[#121416] text-[11px] text-[#7F867F] select-none">
        <span className="font-medium text-[#7F867F]">CodeSync Shared Execution Engine</span>
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="btn-accent flex items-center gap-1.5 px-4 py-1.5 text-xs active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#03110A]" />
          <span>{isRunning ? "Running..." : "Run Code"}</span>
        </button>
      </div>
    </div>
  );
};
