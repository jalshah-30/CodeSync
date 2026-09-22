import React, { useRef, useEffect, useState } from "react";
import { SupportedLanguage, EditorTheme, Collaborator, LineAuthor, ErrorAttribution } from "../types";
import { Play, Copy, Check, AlertTriangle, Bot, Clock } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string, changeDetails?: { line: number; summary: string }) => void;
  language: SupportedLanguage;
  theme: EditorTheme;
  fontSize: number;
  collaborators: Collaborator[];
  lineAuthors?: Record<number, LineAuthor>;
  errorAttribution?: ErrorAttribution | null;
  onCursorChange?: (line: number, ch: number) => void;
  onRunCode: () => void;
  onAskAiToExplain: () => void;
  isRunning?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  theme,
  fontSize,
  collaborators,
  lineAuthors = {},
  errorAttribution,
  onCursorChange,
  onRunCode,
  onAskAiToExplain,
  isRunning,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [currentLine, setCurrentLine] = useState<number>(1);
  const [currentCol, setCurrentCol] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [hoveredCursorUser, setHoveredCursorUser] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // 5-Second Cursor Inactivity Authorship Reveal State
  const [cursorStaySeconds, setCursorStaySeconds] = useState<number>(0);
  const [showAuthorNearCursor, setShowAuthorNearCursor] = useState<boolean>(false);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const lines = code.split("\n");
  const totalLines = Math.max(lines.length, 1);
  const currentLineText = lines[currentLine - 1] ?? "";
  const isCodeLine = currentLineText.trim().length > 0;
  const currentLineAuthor = isCodeLine ? lineAuthors[currentLine] : undefined;

  useEffect(() => {
    setShowAuthorNearCursor(false);
    setCursorStaySeconds(0);

    if (!isFocused || !isCodeLine || !currentLineAuthor) {
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCursorStaySeconds(elapsed);
      if (elapsed >= 5) {
        setShowAuthorNearCursor(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentLine, currentCol, code, isFocused, isCodeLine, currentLineAuthor]);

  const handleSelect = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = code.slice(0, pos);
    const lineArr = textBefore.split("\n");
    const lineNum = lineArr.length;
    const colNum = lineArr[lineArr.length - 1].length + 1;

    setCurrentLine(lineNum);
    setCurrentCol(colNum);
    onCursorChange?.(lineNum, colNum);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRunCode();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode, { line: currentLine, summary: "added indentation" });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          handleSelect();
        }
      }, 0);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);

    const gutter = document.getElementById("editor-gutter");
    if (gutter) {
      gutter.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const sec = Math.floor((Date.now() - timestamp) / 1000);
    if (sec < 5) return "just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
  };

  const lineHeightPx = fontSize * 1.6;
  const charWidthPx = fontSize * 0.605;
  const cursorTopPx = (currentLine - 1) * lineHeightPx + 12 - scrollTop;
  const cursorLeftPx = (currentCol - 1) * charWidthPx + 12 - scrollLeft;

  return (
    <div
      ref={editorContainerRef}
      className="relative flex flex-col h-full rounded-[12px] border border-royal/40 bg-ink overflow-hidden text-cream"
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-royal/40 bg-surface text-xs select-none">
        <div className="flex items-center gap-3">
          {/* Active File / Language */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-cream/50">workspace.</span>
            <span className="text-cream font-bold">{language}</span>
          </div>

          <div className="h-3.5 w-px bg-royal/40 hidden sm:block" />

          {/* 5s Inactivity Authorship Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ink border border-royal/40 text-[11px] text-cream/70">
            <Clock className="w-3 h-3 text-cream/60" />
            <span>5s stay reveals author</span>
          </div>

          {/* Error Attribution Pill if active */}
          {errorAttribution && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-rose-500/40 text-[11px] text-rose-300">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>By {errorAttribution.authorName}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Ask AI to Explain */}
          <button
            onClick={onAskAiToExplain}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink hover:bg-royal/30 text-cream/90 border border-royal/40 text-xs font-medium transition active:scale-95"
            title="Ask AI to explain code"
          >
            <Bot className="w-3.5 h-3.5 text-cream/70" />
            <span className="hidden sm:inline">Explain</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink hover:bg-royal/30 text-cream/80 border border-royal/40 text-xs transition active:scale-95"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#52B788]" /> : <Copy className="w-3.5 h-3.5 text-cream/50" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Run Code Button (Cream pill with ink text) */}
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cream text-ink hover:bg-cream/90 font-semibold text-xs transition active:scale-95 disabled:opacity-50"
            title="Execute Code (Ctrl + Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>

      {/* Top Banner if Error Attribution exists */}
      {errorAttribution && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-[12px] bg-surface border border-rose-500/40 text-cream flex items-center justify-between gap-3 text-xs z-20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
              style={{ backgroundColor: errorAttribution.authorColor }}
            >
              {errorAttribution.authorName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-rose-300 font-medium">Error Caused By:</span>
                <span className="font-semibold text-cream">{errorAttribution.authorName}</span>
                {errorAttribution.line && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink border border-royal/40 text-cream/70">
                    Line {errorAttribution.line}
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-cream/80 truncate mt-0.5">
                {errorAttribution.errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onAskAiToExplain}
            className="px-2.5 py-1 rounded-full bg-cream text-ink font-semibold text-xs shrink-0 transition hover:bg-cream/90"
          >
            Auto-Fix
          </button>
        </div>
      )}

      {/* Editor Body: Gutter + Code Area */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          id="editor-gutter"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
          }}
          className="w-12 py-3 px-1 select-none text-right font-mono text-cream/35 bg-surface/30 border-r border-royal/30 overflow-hidden shrink-0"
        >
          {Array.from({ length: totalLines }).map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === currentLine;
            const author = lineAuthors[lineNum];
            const isErrorLine = errorAttribution?.line === lineNum;

            return (
              <div
                key={lineNum}
                onMouseEnter={() => setHoveredLine(lineNum)}
                onMouseLeave={() => setHoveredLine(null)}
                className={`flex items-center justify-between px-1 transition-colors cursor-pointer ${
                  isErrorLine
                    ? "bg-rose-500/20 text-rose-300 font-bold"
                    : isCurrent
                    ? "text-cream font-bold bg-royal/20"
                    : "hover:text-cream/80"
                }`}
                title={
                  isErrorLine
                    ? `Error on line ${lineNum}: authored by ${errorAttribution?.authorName}`
                    : author
                    ? `Line ${lineNum}: Authored by ${author.userName} (${formatTimeAgo(author.timestamp)})`
                    : `Line ${lineNum}`
                }
              >
                {isErrorLine ? (
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                ) : author && lines[i]?.trim() ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 opacity-80"
                    style={{ backgroundColor: author.userColor }}
                  />
                ) : (
                  <span className="w-1.5" />
                )}

                <span className="ml-auto text-[11px]">{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea & Remote Cursors */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Floating Author Tag Near Cursor (Triggered after 5s staying on line) */}
          {showAuthorNearCursor && isFocused && isCodeLine && currentLineAuthor && (
            <div
              style={{
                top: `${Math.max(8, cursorTopPx - 36)}px`,
                left: `${Math.max(12, cursorLeftPx + 14)}px`,
              }}
              className="absolute z-30 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded-[12px] bg-surface border border-royal/60 shadow-lg select-none"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: currentLineAuthor.userColor }}
              />
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                <span className="text-cream/60">Written by</span>
                <span className="font-semibold text-cream">{currentLineAuthor.userName}</span>
                <span className="text-cream/40">• {formatTimeAgo(currentLineAuthor.timestamp)}</span>
              </div>
            </div>
          )}

          {/* Collaborative Remote Cursors Layer */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden pl-3 pt-3">
            {collaborators.map((collab) => {
              if (!collab.cursor) return null;
              const { line, ch, timestamp } = collab.cursor;

              const remoteLineText = lines[line - 1];
              if (remoteLineText === undefined || !remoteLineText.trim()) {
                return null;
              }

              const topPx = (line - 1) * lineHeightPx - scrollTop;
              const leftPx = (ch - 1) * charWidthPx - scrollLeft;

              const now = Date.now();
              const stayedFiveSeconds = timestamp ? now - timestamp >= 5000 : false;
              const isHovered = hoveredCursorUser === collab.id;
              const showNameTag = stayedFiveSeconds || isHovered;

              return (
                <div
                  key={collab.id}
                  style={{
                    transform: `translate3d(${leftPx}px, ${topPx}px, 0)`,
                    transition: "transform 0.12s ease-out",
                  }}
                  className="absolute pointer-events-auto cursor-default flex flex-col items-start"
                  onMouseEnter={() => setHoveredCursorUser(collab.id)}
                  onMouseLeave={() => setHoveredCursorUser(null)}
                >
                  {/* Caret line */}
                  <div
                    style={{
                      backgroundColor: collab.color,
                      height: `${lineHeightPx}px`,
                    }}
                    className="w-0.5"
                  />

                  {/* Remote User Name Tag */}
                  <div
                    style={{ backgroundColor: collab.color }}
                    className={`text-[10px] font-sans font-semibold text-white px-1.5 py-0.2 rounded shadow-md -mt-1 -ml-1 whitespace-nowrap transition-all duration-200 ${
                      showNameTag
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-75 pointer-events-none"
                    }`}
                  >
                    {collab.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              const newCode = e.target.value;
              onChange(newCode, { line: currentLine, summary: `edited line ${currentLine}` });
            }}
            onFocus={() => {
              setIsFocused(true);
              handleSelect();
            }}
            onBlur={() => {
              setIsFocused(false);
              setShowAuthorNearCursor(false);
              setCursorStaySeconds(0);
            }}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: "1.6",
              tabSize: 2,
            }}
            className="w-full h-full p-3 bg-transparent text-cream font-mono outline-none resize-none overflow-y-auto leading-relaxed selection:bg-royal selection:text-cream"
            placeholder="// Enter or collaborate on code here..."
          />
        </div>
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-royal/40 bg-surface text-[11px] text-cream/60 select-none">
        <div className="flex items-center gap-4">
          <span>
            Ln <strong className="text-cream font-mono">{currentLine}</strong>, Col{" "}
            <strong className="text-cream font-mono">{currentCol}</strong>
          </span>

          {/* Cursor Stay Author Status Indicator */}
          {isFocused && isCodeLine && currentLineAuthor && (
            <div className="flex items-center gap-1.5 px-2 py-0.2 rounded-full bg-ink border border-royal/40">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: currentLineAuthor.userColor }}
              />
              <span className="text-cream/80">
                Author: <strong>{currentLineAuthor.userName}</strong>
              </span>
              {!showAuthorNearCursor && cursorStaySeconds > 0 && cursorStaySeconds < 5 && (
                <span className="text-cream/40 text-[10px]">
                  ({5 - cursorStaySeconds}s)
                </span>
              )}
            </div>
          )}

          <span className="hidden md:inline">{totalLines} lines</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
            <span className="text-cream/80">Live sync</span>
          </div>
          <span className="font-mono text-cream/40">UTF-8</span>
          <span className="font-mono text-cream/40">Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
