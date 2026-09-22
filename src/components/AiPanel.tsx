import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Bug,
  BookOpen,
  CheckCircle,
  FileCode,
  Wand2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  MessageSquare,
  Send,
  X,
  Code2,
} from "lucide-react";
import { SupportedLanguage, AIDebugResult, AICodeReview } from "../types";

interface AiPanelProps {
  code: string;
  language: SupportedLanguage;
  output: string;
  input: string;
  onApplyCode: (newCode: string) => void;
  onClose?: () => void;
  initialTab?: "explain" | "debug" | "review" | "generate" | "chat";
  explainTrigger?: number;
}

export const AiPanel: React.FC<AiPanelProps> = ({
  code,
  language,
  output,
  input,
  onApplyCode,
  onClose,
  initialTab = "explain",
  explainTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<"explain" | "debug" | "review" | "generate" | "chat">(
    initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (explainTrigger && explainTrigger > 0) {
      setActiveTab("explain");
      handleExplain();
    }
  }, [explainTrigger]);

  // States for features
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Explain
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainedCode, setExplainedCode] = useState<string | null>(null);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  // 2. Debug & Fix
  const [debugResult, setDebugResult] = useState<AIDebugResult | null>(null);
  const [fixedApplied, setFixedApplied] = useState(false);

  // 3. Code Review
  const [reviewResult, setReviewResult] = useState<AICodeReview | null>(null);
  const [reviewApplied, setReviewApplied] = useState(false);

  // 4. Generate
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [genApplied, setGenApplied] = useState(false);

  // 5. Chat
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: `Hello! I'm CodeSync AI, powered by Gemini. Ask me any questions about your team's ${language} code, algorithms, or bug fixes.`,
    },
  ]);

  // Handler: Explain Code
  const handleExplain = async () => {
    if (!code || !code.trim()) {
      setErrorMessage("No code provided in editor to explain.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to explain code");
      setExplanation(data.explanation);
      setExplainedCode(code);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate explanation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  // Handler: Debug & Fix
  const handleDebug = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setFixedApplied(false);
    try {
      const res = await fetch("/api/ai/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, errorOutput: output, input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to debug code");
      setDebugResult(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Review Code
  const handleReview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setReviewApplied(false);
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to review code");
      setReviewResult(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Generate Code
  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setGenApplied(false);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generatePrompt, language, existingCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to generate code");
      setGeneratedCode(data.generatedCode);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg }],
          code,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to get AI reply");
      setChatMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `Sorry, I encountered an error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100">
      {/* Header with Title and Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              CodeSync AI
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Intelligent Team Co-Pilot</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Feature Nav Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-900/90 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab("explain");
            if (!explanation) handleExplain();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === "explain"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("debug");
            if (!debugResult) handleDebug();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === "debug"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Debug & Fix</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("review");
            if (!reviewResult) handleReview();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === "review"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Code Review</span>
        </button>

        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === "generate"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Generate</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
            activeTab === "chat"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <p className="font-medium text-slate-300 animate-pulse">
              CodeSync AI is analyzing {language} code...
            </p>
          </div>
        )}

        {errorMessage && !isLoading && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <div className="font-semibold mb-1">AI Request Notice</div>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* 1. Explain Tab */}
        {activeTab === "explain" && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-medium">Detailed Code Breakdown</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {language.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {explanation && (
                  <button
                    onClick={handleCopyExplanation}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
                    title="Copy full explanation"
                  >
                    {copiedExplanation ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleExplain}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 hover:text-white border border-violet-500/30 text-[11px] font-medium transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{explanation ? "Re-explain" : "Explain"}</span>
                </button>
              </div>
            </div>

            {/* Changed Code Alert if user modified the editor */}
            {explanation && explainedCode && explainedCode !== code && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                <span>Code in editor has changed since last explanation.</span>
                <button
                  onClick={handleExplain}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium underline transition"
                >
                  Update Explanation
                </button>
              </div>
            )}

            {explanation ? (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
                <div className="markdown-body">
                  <Markdown>{explanation}</Markdown>
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Understand your shared code</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                    CodeSync AI breaks down logic, algorithms, Big-O complexities, and key edge cases for your team.
                  </p>
                </div>
                <button
                  onClick={handleExplain}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Explain Current Code</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Debug & Fix Tab (Slide 4: Fix & Re-run) */}
        {activeTab === "debug" && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Automatic Bug & Error Solver</span>
              <button
                onClick={handleDebug}
                className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-scan</span>
              </button>
            </div>

            {debugResult ? (
              <div className="space-y-3">
                {/* Summary Box */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5" />
                    <span>Issue: {debugResult.summary}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{debugResult.rootCause}</p>
                </div>

                {/* Changes List */}
                {debugResult.changesMade && debugResult.changesMade.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Fixes Applied by AI:
                    </span>
                    <ul className="space-y-1">
                      {debugResult.changesMade.map((change, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1-Click Apply Button */}
                {debugResult.fixedCode && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onApplyCode(debugResult.fixedCode);
                        setFixedApplied(true);
                      }}
                      disabled={fixedApplied}
                      className={`w-full py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                        fixedApplied
                          ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                      }`}
                    >
                      {fixedApplied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Applied to Editor!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Apply Fixed Code to Shared Editor</span>
                        </>
                      )}
                    </button>

                    {/* Preview Fixed Code */}
                    <div className="mt-3">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">
                        Fixed Code Preview:
                      </span>
                      <pre className="p-3 bg-black/50 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                        {debugResult.fixedCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleDebug}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                <Bug className="w-4 h-4" />
                <span>Scan & Debug Code</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Code Review Tab */}
        {activeTab === "review" && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Senior Engineer Review</span>
              <button
                onClick={handleReview}
                className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Audit Again</span>
              </button>
            </div>

            {reviewResult ? (
              <div className="space-y-3">
                {/* Quality Score Card */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">Quality Score</span>
                    <div className="text-xl font-bold text-cyan-400">
                      {reviewResult.overallScore} / 100
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Verdict</span>
                    <div className="text-xs font-semibold text-emerald-400">
                      {reviewResult.verdict}
                    </div>
                  </div>
                </div>

                {/* Improvements */}
                {reviewResult.improvements && reviewResult.improvements.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Recommended Improvements:
                    </span>
                    {reviewResult.improvements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300"
                      >
                        <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs mb-0.5">
                          <Zap className="w-3 h-3" />
                          <span>{imp.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{imp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Refactored Code */}
                {reviewResult.improvedCode && (
                  <div>
                    <button
                      onClick={() => {
                        onApplyCode(reviewResult.improvedCode!);
                        setReviewApplied(true);
                      }}
                      disabled={reviewApplied}
                      className={`w-full py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition ${
                        reviewApplied
                          ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                          : "bg-violet-600 hover:bg-violet-500 text-white"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{reviewApplied ? "Applied Refactored Code!" : "Apply Refactored Code"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleReview}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Run Code Review</span>
              </button>
            )}
          </div>
        )}

        {/* 4. Generate Tab */}
        {activeTab === "generate" && !isLoading && (
          <div className="space-y-3">
            <span className="text-slate-400 font-medium block">
              Generate Functions or Complete Code
            </span>
            <div className="space-y-2">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder={`Describe what you want to write in ${language} (e.g. "Create a binary search function with test cases", "Build an LRU Cache")...`}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 resize-none h-20 outline-none focus:border-violet-500 font-sans text-xs"
              />
              <button
                onClick={handleGenerate}
                disabled={!generatePrompt.trim()}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-1.5 shadow transition"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Code</span>
              </button>
            </div>

            {generatedCode && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Generated Output:</span>
                  <button
                    onClick={() => {
                      onApplyCode(generatedCode);
                      setGenApplied(true);
                    }}
                    disabled={genApplied}
                    className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{genApplied ? "Applied!" : "Insert into Editor"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-black/60 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56">
                  {generatedCode}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 5. In-Room AI Chat Tab */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-800 text-slate-200 ml-6"
                      : "bg-violet-950/40 border border-violet-800/40 text-violet-200 mr-6"
                  }`}
                >
                  <div className="font-semibold text-[10px] text-slate-400 mb-0.5">
                    {msg.role === "user" ? "You" : "CodeSync AI"}
                  </div>
                  {msg.role === "ai" ? (
                    <div className="markdown-body text-xs">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask AI anything about the room's code..."
                className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs outline-none focus:border-violet-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
