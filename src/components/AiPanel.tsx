import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Bug,
  BookOpen,
  Wand2,
  RefreshCw,
  Copy,
  MessageSquare,
  Send,
  X,
  Check,
  BarChart2,
} from "lucide-react";
import { SupportedLanguage, AIDebugResult, AICodeReview, FullCodeQualityReport } from "../types";

interface AiPanelProps {
  code: string;
  language: SupportedLanguage;
  output: string;
  input: string;
  onApplyCode: (newCode: string) => void;
  onClose?: () => void;
  initialTab?: "explain" | "quality" | "debug" | "review" | "generate" | "chat";
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
  const [activeTab, setActiveTab] = useState<
    "explain" | "quality" | "debug" | "review" | "generate" | "chat"
  >(initialTab);

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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copiedExplanation, setCopiedExplanation] = useState(false);
  const [qualityReport, setQualityReport] = useState<FullCodeQualityReport | null>(null);
  const [refactorApplied, setRefactorApplied] = useState(false);
  const [debugResult, setDebugResult] = useState<AIDebugResult | null>(null);
  const [fixedApplied, setFixedApplied] = useState(false);
  const [reviewResult, setReviewResult] = useState<AICodeReview | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [genApplied, setGenApplied] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: `Hello! I'm CodeSync AI, your STEM coding co-pilot. Ask me any questions about ${language} syntax, physics/math simulation formulas, or collaborative debugging.`,
    },
  ]);

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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate explanation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityAnalysis = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setRefactorApplied(false);
    try {
      const res = await fetch("/api/ai/quality-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Failed to analyze code quality");
      setQualityReport(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate quality report");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col h-full bg-[#07090A] border-0 text-[#FFFFFF] font-sans text-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1E2021] bg-[#121416] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0DCC5C] text-[#03110A] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#03110A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
              CodeSync AI Tutor
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] border border-[#292C2D]">
                Gemini
              </span>
            </h2>
            <p className="text-[11px] text-[#7F867F] font-medium">STEM Code Assistant & Quality Analysis</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224] transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1E2021] bg-[#07090A] text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab("quality");
            if (!qualityReport) handleQualityAnalysis();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
            activeTab === "quality"
              ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
              : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224]"
          }`}
        >
          <BarChart2 className={`w-3.5 h-3.5 ${activeTab === "quality" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
          <span>Code Quality</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("explain");
            if (!explanation) handleExplain();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
            activeTab === "explain"
              ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
              : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224]"
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === "explain" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
          <span>Explain</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("debug");
            if (!debugResult) handleDebug();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
            activeTab === "debug"
              ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
              : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224]"
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${activeTab === "debug" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
          <span>Debug & Fix</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
            activeTab === "chat"
              ? "bg-[#0DCC5C] text-[#03110A] shadow-xs"
              : "text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#202224]"
          }`}
        >
          <MessageSquare className={`w-3.5 h-3.5 ${activeTab === "chat" ? "text-[#03110A]" : "text-[#7F867F]"}`} />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center justify-between font-medium">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-[#7F867F]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0DCC5C]" />
            <span className="text-xs font-semibold">Analyzing code with AI...</span>
          </div>
        )}

        {/* Quality Analysis Tab */}
        {activeTab === "quality" && !isLoading && (
          <div className="space-y-3 text-xs">
            {qualityReport ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#17191A] border border-[#1E2021] flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-[#7F867F] uppercase font-bold tracking-wider">
                      Health Score
                    </span>
                    <div className="text-3xl font-extrabold text-[#FFFFFF] flex items-baseline gap-1">
                      <span>{qualityReport.overallScore}</span>
                      <span className="text-xs text-[#7F867F] font-normal">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right max-w-[180px]">
                    <span className="text-xs text-[#0DCC5C] font-bold block">{qualityReport.verdict}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#17191A] border border-[#1E2021] space-y-1.5 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F867F] block">
                    Computational Complexity (Big-O)
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] font-bold border border-[#292C2D]">
                      Time: {qualityReport.bigOComplexity.time}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] font-bold border border-[#292C2D]">
                      Space: {qualityReport.bigOComplexity.space}
                    </span>
                  </div>
                  <p className="text-xs text-[#7F867F] mt-1">{qualityReport.bigOComplexity.explanation}</p>
                </div>

                {qualityReport.refactoredCode && (
                  <button
                    onClick={() => {
                      onApplyCode(qualityReport.refactoredCode!);
                      setRefactorApplied(true);
                      setTimeout(() => setRefactorApplied(false), 2000);
                    }}
                    className={`w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs ${
                      refactorApplied
                        ? "bg-[#202224] text-[#0DCC5C] border border-[#292C2D]"
                        : "bg-[#0DCC5C] text-[#03110A] hover:bg-[#0BB652]"
                    }`}
                  >
                    {refactorApplied ? <Check className="w-4 h-4 text-[#0DCC5C] font-bold" /> : <Wand2 className="w-4 h-4 text-[#03110A]" />}
                    <span>{refactorApplied ? "Refactored Code Applied!" : "Apply Refactored Code"}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-[#7F867F] border border-dashed border-[#292C2D] rounded-2xl space-y-2">
                <p className="font-medium text-xs">Analyze editor code for Big-O complexity & quality.</p>
                <button
                  onClick={handleQualityAnalysis}
                  className="px-4 py-2 rounded-full bg-[#0DCC5C] text-[#03110A] font-semibold text-xs shadow-xs hover:bg-[#0BB652] transition"
                >
                  Analyze Quality
                </button>
              </div>
            )}
          </div>
        )}

        {/* Explain Tab */}
        {activeTab === "explain" && !isLoading && (
          <div className="space-y-3">
            {explanation ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#1E2021]">
                  <span className="text-xs font-bold text-[#FFFFFF]">Explanation</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(explanation);
                      setCopiedExplanation(true);
                      setTimeout(() => setCopiedExplanation(false), 2000);
                    }}
                    className="text-xs font-semibold text-[#7F867F] hover:text-[#0DCC5C] flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedExplanation ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="markdown-body text-xs text-[#FFFFFF] leading-relaxed p-4 rounded-2xl bg-[#17191A] border border-[#1E2021] shadow-xs">
                  <Markdown>{explanation}</Markdown>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-[#7F867F] border border-dashed border-[#292C2D] rounded-2xl space-y-2">
                <p className="font-medium text-xs">Get a detailed breakdown of how your code works.</p>
                <button
                  onClick={handleExplain}
                  className="px-4 py-2 rounded-full bg-[#0DCC5C] text-[#03110A] font-semibold text-xs shadow-xs hover:bg-[#0BB652] transition"
                >
                  Explain Code
                </button>
              </div>
            )}
          </div>
        )}

        {/* Debug Tab */}
        {activeTab === "debug" && !isLoading && (
          <div className="space-y-3">
            {debugResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#17191A] border border-[#1E2021] shadow-xs">
                  <span className="font-bold text-[#FFFFFF] text-sm block mb-1">
                    {debugResult.summary}
                  </span>
                  <p className="text-[#7F867F] leading-relaxed">{debugResult.rootCause}</p>
                </div>

                <button
                  onClick={() => {
                    onApplyCode(debugResult.fixedCode);
                    setFixedApplied(true);
                  }}
                  disabled={fixedApplied}
                  className="w-full py-2.5 rounded-full bg-[#0DCC5C] hover:bg-[#0BB652] text-[#03110A] font-semibold text-xs transition shadow-xs disabled:opacity-50"
                >
                  {fixedApplied ? "Fixed Code Applied!" : "Apply Fixed Code"}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-[#7F867F] border border-dashed border-[#292C2D] rounded-2xl space-y-2">
                <p className="font-medium text-xs">Analyze code errors and generate automatic bug fixes.</p>
                <button
                  onClick={handleDebug}
                  className="px-4 py-2 rounded-full bg-[#0DCC5C] text-[#03110A] font-semibold text-xs shadow-xs hover:bg-[#0BB652] transition"
                >
                  Debug Code
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
                    msg.role === "user"
                      ? "bg-[#0D6430] text-[#FFFFFF] border border-[#0DCC5C]/30 ml-6 rounded-tr-xs"
                      : "bg-[#202224] border border-[#292C2D] text-[#FFFFFF] mr-6 rounded-tl-xs"
                  }`}
                >
                  <div className="font-bold text-[10px] text-[#7F867F] mb-0.5">
                    {msg.role === "user" ? "You" : "CodeSync AI"}
                  </div>
                  {msg.role === "ai" ? (
                    <div className="markdown-body text-xs text-[#FFFFFF]">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E2021]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask AI about formulas or syntax..."
                className="flex-1 px-3.5 py-2 bg-[#17191A] border border-[#292C2D] rounded-full text-[#FFFFFF] text-xs outline-none focus:border-[#0DCC5C] placeholder:text-[#7F867F] shadow-xs"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="p-2 rounded-full bg-[#0DCC5C] hover:bg-[#0BB652] text-[#03110A] disabled:opacity-40 transition shadow-xs"
              >
                <Send className="w-4 h-4 text-[#03110A]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
