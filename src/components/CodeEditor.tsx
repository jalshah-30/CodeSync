import React, { useRef, useEffect, useState } from "react";
import { SupportedLanguage, EditorTheme, Collaborator, LineAuthor, ErrorAttribution } from "../types";
import { Sparkles, Play, Copy, Check, Clock, AlertTriangle } from "lucide-react";

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
  sharedBreakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
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
  sharedBreakpoints = [],
  onToggleBreakpoint,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [currentLine, setCurrentLine] = useState<number>(1);
  const [currentCol, setCurrentCol] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [hoveredCursorUser, setHoveredCursorUser] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

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

    return () => {
      clearInterval(interval);
    };
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
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode, { line: currentLine, summary: "indent line" });
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
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

  const lineHeightPx = fontSize * 1.6;
  const charWidthPx = fontSize * 0.6;
  const cursorTopPx = (currentLine - 1) * lineHeightPx + 12 - scrollTop;
  const cursorLeftPx = (currentCol - 1) * charWidthPx + 12 - scrollLeft;

  return (
    <div
      ref={editorContainerRef}
      className="panel-card relative flex flex-col h-full rounded-2xl border border-[#1E2021] shadow-md overflow-hidden bg-[#07090A] text-[#FFFFFF]"
    >
      {/* Editor Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E2021] bg-[#121416] select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#202224]" />
            <div className="w-3 h-3 rounded-full bg-[#202224]" />
            <div className="w-3 h-3 rounded-full bg-[#202224]" />
          </div>

          <div className="h-4 w-px bg-[#1E2021]" />

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#7F867F]">file.</span>
            <span className="text-[#0DCC5C] font-bold px-2.5 py-0.5 rounded-full bg-[#202224] border border-[#1E2021]">{language}</span>
          </div>

          {errorAttribution && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 font-semibold shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Fault: <strong>{errorAttribution.authorName}</strong></span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAskAiToExplain}
            className="btn-accent flex items-center gap-1.5 px-3 py-1 text-xs font-semibold transition active:scale-95 shadow-xs"
            title="Ask AI to explain code"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#03110A]" />
            <span className="hidden sm:inline">Explain</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="btn-secondary flex items-center gap-1 px-3 py-1 text-xs transition active:scale-95 shadow-xs text-[#7F867F] hover:text-[#FFFFFF]"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0DCC5C] font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="btn-accent flex items-center gap-1.5 px-4 py-1 text-xs active:scale-95 disabled:opacity-50"
            title="Execute Code"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#03110A]" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden bg-[#07090A] text-[#FFFFFF]">
        {/* Line Numbers Gutter */}
        <div
          id="editor-gutter"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
          }}
          className="w-14 py-3 px-1 select-none text-right font-mono text-[#7F867F] bg-[#07090A] border-r border-[#1E2021] overflow-hidden shrink-0"
        >
          {Array.from({ length: totalLines }).map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === currentLine;
            const author = lineAuthors[lineNum];
            const isErrorLine = errorAttribution?.line === lineNum;
            const hasBreakpoint = sharedBreakpoints.includes(lineNum);

            return (
              <div
                key={lineNum}
                onClick={() => onToggleBreakpoint?.(lineNum)}
                onMouseEnter={() => setHoveredLine(lineNum)}
                onMouseLeave={() => setHoveredLine(null)}
                className={`flex items-center justify-between px-1 transition-colors cursor-pointer ${
                  hasBreakpoint
                    ? "bg-rose-500/30 text-rose-200 font-bold"
                    : isErrorLine
                    ? "bg-rose-500/30 text-rose-200 font-bold border-r-2 border-rose-500"
                    : isCurrent
                    ? "text-[#FFFFFF] font-bold bg-[#202224] rounded-l"
                    : "hover:text-[#FFFFFF] hover:bg-[#17191A]"
                }`}
              >
                {hasBreakpoint ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                ) : isErrorLine ? (
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                ) : author && lines[i]?.trim() ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 opacity-80"
                    style={{ backgroundColor: author.userColor }}
                  />
                ) : (
                  <span className="w-1.5" />
                )}

                <span className="ml-auto">{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea & Remote Cursors */}
        <div className="relative flex-1 h-full overflow-hidden">
          {showAuthorNearCursor && isFocused && isCodeLine && currentLineAuthor && (
            <div
              style={{
                top: `${Math.max(8, cursorTopPx - 40)}px`,
                left: `${Math.max(12, cursorLeftPx + 14)}px`,
                borderColor: currentLineAuthor.userColor,
              }}
              className="absolute z-30 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#17191A] border border-[#1E2021] shadow-xl backdrop-blur select-none font-sans text-xs text-[#FFFFFF]"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLineAuthor.userColor }} />
              <span>Written by <strong>{currentLineAuthor.userName}</strong> (L{currentLine})</span>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden pl-3 pt-3">
            {collaborators.map((collab) => {
              if (!collab.cursor) return null;
              const { line, ch, timestamp } = collab.cursor;
              const remoteLineText = lines[line - 1];
              if (remoteLineText === undefined || !remoteLineText.trim()) return null;

              const topPx = (line - 1) * lineHeightPx - scrollTop;
              const leftPx = (ch - 1) * charWidthPx - scrollLeft;
              const now = Date.now();
              const stayedFiveSeconds = timestamp ? now - timestamp >= 5000 : false;
              const isHovered = hoveredCursorUser === collab.id;

              return (
                <div
                  key={collab.id}
                  style={{
                    transform: `translate3d(${leftPx}px, ${topPx}px, 0)`,
                  }}
                  className="absolute pointer-events-auto cursor-default flex flex-col items-start"
                  onMouseEnter={() => setHoveredCursorUser(collab.id)}
                  onMouseLeave={() => setHoveredCursorUser(null)}
                >
                  <div
                    style={{ backgroundColor: collab.color, height: `${lineHeightPx}px` }}
                    className="w-0.5 remote-cursor-line"
                  />
                  {(stayedFiveSeconds || isHovered) && (
                    <div
                      style={{ backgroundColor: collab.color }}
                      className="text-[10px] font-sans font-bold text-white px-1.5 py-0.5 rounded shadow -mt-1 -ml-1 whitespace-nowrap"
                    >
                      {collab.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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
            className="w-full h-full p-3 bg-transparent text-[#FFFFFF] font-mono outline-none resize-none overflow-y-auto leading-relaxed"
            placeholder="// Write code here..."
          />
        </div>
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#1E2021] bg-[#121416] text-[11px] text-[#7F867F] select-none font-sans">
        <div className="flex items-center gap-4">
          <span>
            Ln <strong className="text-[#FFFFFF] font-mono">{currentLine}</strong>, Col{" "}
            <strong className="text-[#FFFFFF] font-mono">{currentCol}</strong>
          </span>
          {isFocused && isCodeLine && currentLineAuthor && (
            <span className="text-[#7F867F]">
              Authored by: <strong style={{ color: currentLineAuthor.userColor }}>{currentLineAuthor.userName}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0DCC5C]" />
            <span className="text-[#FFFFFF] font-semibold">Live Sync Active</span>
          </div>
          <span className="font-mono">UTF-8</span>
        </div>
      </div>
    </div>
  );
};
