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
  ArrowRight,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";
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
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80 select-none">
        {/* Tabs: Output (stdout) vs Input (stdin) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
              activeTab === "output"
                ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Output (stdout)</span>
            {status === "success" && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {status === "error" && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("input")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
              activeTab === "input"
                ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Input (stdin)</span>
            {input.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Execution Time & Result Badge */}
          {executionTime && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{executionTime}s</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>Exit 0</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" />
              <span>Error</span>
            </div>
          )}

          {/* Quick AI Debug Button if error occurred */}
          {isError && (
            <button
              onClick={onAskAiToDebug}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 text-[11px] font-medium transition active:scale-95"
              title="Fix this error automatically with CodeSync AI"
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Debug with AI</span>
            </button>
          )}

          {/* Copy Button */}
          {output && activeTab === "output" && (
            <button
              onClick={handleCopyOutput}
              title="Copy Output"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Clear Button */}
          {output && activeTab === "output" && (
            <button
              onClick={onClearOutput}
              title="Clear Output"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed select-text">
        {activeTab === "output" ? (
          <div>
            {isRunning ? (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse py-4">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Executing code in isolated environment...</span>
              </div>
            ) : output ? (
              <div className="space-y-2">
                {/* Visual indicator badge as requested on slide 4 (Success / Error Display) */}
                {isError ? (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-200 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {errorAttribution ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md ring-2 ring-rose-500/40"
                            style={{ backgroundColor: errorAttribution.authorColor }}
                          >
                            {errorAttribution.authorName.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-rose-300">
                              Execution Error Detected
                            </span>
                            {errorAttribution && (
                              <>
                                <span className="text-xs text-rose-300/80">• Caused by:</span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-bold text-white shadow-sm"
                                  style={{ backgroundColor: errorAttribution.authorColor }}
                                >
                                  {errorAttribution.authorName}
                                </span>
                                {errorAttribution.line && (
                                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-rose-500/40 text-rose-400 font-semibold">
                                    Line {errorAttribution.line}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-rose-300/90 font-mono mt-1">
                            {errorAttribution?.errorMessage || "Review the execution traceback below."}
                          </p>
                          {errorAttribution && (
                            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                              The runtime fault occurred in code authored by <strong>{errorAttribution.authorName}</strong>.
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={onAskAiToDebug}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-sans font-medium text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 whitespace-nowrap active:scale-95 transition shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Fix with AI</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Program executed successfully</span>
                    </div>
                    <span className="text-[11px] text-emerald-400/80">
                      Output synchronized with team
                    </span>
                  </div>
                )}

                <pre className="whitespace-pre-wrap break-words text-slate-200 bg-black/40 p-3 rounded-lg border border-slate-800">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-8">
                <Terminal className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                <p className="text-slate-400 font-sans font-medium text-xs">Ready for execution</p>
                <p className="text-slate-500 text-[11px] mt-1 font-sans">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Enter</kbd> or click Run
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <label className="text-[11px] text-slate-400 mb-1 block font-sans">
              Program Standard Input (Passed to input() / stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter standard input values (one per line)..."
              className="flex-1 w-full p-2.5 bg-black/30 text-slate-200 border border-slate-800 rounded-lg resize-none outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>
        )}
      </div>

      {/* Terminal Footer with Quick Run */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/60 text-[11px] text-slate-400 select-none">
        <span className="text-slate-500">Shared Execution Engine</span>
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-sans font-medium text-xs shadow transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isRunning ? "Running..." : "Save & Run"}</span>
        </button>
      </div>
    </div>
  );
};
