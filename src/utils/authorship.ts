import { LineAuthor, ErrorAttribution, Collaborator } from "../types";

/**
 * Generates initial line-by-line attribution across collaborators
 * so that collaborative author tracking is immediately visible and demonstrable.
 */
export function generateInitialLineAuthors(
  code: string,
  collaborators: Collaborator[] = [],
  currentUser: { id: string; name: string; color: string }
): Record<number, LineAuthor> {
  const lines = code.split("\n");
  const result: Record<number, LineAuthor> = {};
  const now = Date.now();

  // Only real contributors: current user + any real collaborators present
  const pool: Array<{ id: string; name: string; color: string }> = [
    { id: currentUser.id, name: currentUser.name, color: currentUser.color || "#06b6d4" },
    ...collaborators
      .filter((c) => c.id !== currentUser.id)
      .map((c) => ({ id: c.id, name: c.name, color: c.color })),
  ];

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    // Do NOT assign authorship to empty lines or lines with no code
    if (!lineText.trim()) {
      return;
    }

    // Assign line to real collaborators present in the room; if alone, to currentUser
    const authorIndex = pool.length > 1 ? index % pool.length : 0;
    const assigned = pool[authorIndex] || pool[0];

    result[lineNum] = {
      line: lineNum,
      userId: assigned.id,
      userName: assigned.name,
      userColor: assigned.color,
      timestamp: now,
      lastEditSummary: `wrote "${lineText.trim().slice(0, 30)}"`,
    };
  });

  return result;
}

/**
 * Updates line attribution when code is modified, re-mapping lines if lines were inserted/deleted
 */
export function updateLineAuthors(
  prevAuthors: Record<number, LineAuthor>,
  oldCode: string,
  newCode: string,
  author: { id: string; name: string; color: string },
  changeLine?: number
): Record<number, LineAuthor> {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const updated: Record<number, LineAuthor> = {};
  const now = Date.now();

  const lineDiff = newLines.length - oldLines.length;

  newLines.forEach((text, idx) => {
    const lineNum = idx + 1;

    // Do NOT assign authorship to lines with no code (empty or whitespace only)
    if (!text.trim()) {
      return;
    }

    // If this is the directly edited line
    if (changeLine && lineNum === changeLine) {
      updated[lineNum] = {
        line: lineNum,
        userId: author.id,
        userName: author.name,
        userColor: author.color,
        timestamp: now,
        lastEditSummary: `updated line ${lineNum}`,
      };
      return;
    }

    // Attempt to map from old line author
    let oldLineNum = lineNum;
    if (changeLine && lineNum > changeLine) {
      oldLineNum = lineNum - lineDiff;
    }

    if (prevAuthors[oldLineNum] && oldLines[oldLineNum - 1] === text) {
      // Line content unchanged, keep author
      updated[lineNum] = {
        ...prevAuthors[oldLineNum],
        line: lineNum,
      };
    } else {
      // Line modified or new line created by current author
      updated[lineNum] = {
        line: lineNum,
        userId: author.id,
        userName: author.name,
        userColor: author.color,
        timestamp: now,
        lastEditSummary: `edited line ${lineNum}`,
      };
    }
  });

  return updated;
}

/**
 * Extracts line number, error message, and the author who wrote that error-causing line
 */
export function parseErrorAttribution(
  output: string,
  stderr: string,
  lineAuthors: Record<number, LineAuthor>,
  fallbackAuthor: { name: string; color: string }
): ErrorAttribution | null {
  const combined = `${stderr || ""}\n${output || ""}`.trim();
  if (!combined) return null;

  // Check if output actually indicates an error
  const isError =
    combined.includes("Traceback (most recent call last)") ||
    combined.includes("Error:") ||
    combined.includes("Exception:") ||
    combined.toLowerCase().includes("syntaxerror") ||
    combined.toLowerCase().includes("runtime error") ||
    combined.toLowerCase().includes("zerodivisionerror") ||
    combined.toLowerCase().includes("typeerror") ||
    combined.toLowerCase().includes("referenceerror") ||
    combined.toLowerCase().includes("nameerror") ||
    combined.toLowerCase().includes("indexerror") ||
    combined.toLowerCase().includes("valueerror") ||
    combined.toLowerCase().includes("fatal error") ||
    combined.toLowerCase().includes("segmentation fault");

  if (!isError) return null;

  let foundLine: number | undefined;
  let errorMessage = "";
  let errorType = "Runtime Error";

  // 1. Python Traceback matching
  // Matches: File "...", line 18, in <module>
  const pyLineMatches = Array.from(combined.matchAll(/File\s+["'][^"']+["'],\s+line\s+(\d+)/gi));
  if (pyLineMatches.length > 0) {
    // Usually the last traceback entry is the actual offending line in user code
    const lastMatch = pyLineMatches[pyLineMatches.length - 1];
    foundLine = parseInt(lastMatch[1], 10);
  }

  // 2. Python / JS / Node Error type and message line (e.g. ZeroDivisionError: division by zero)
  const errMatch = combined.match(/([A-Z][A-Za-z0-9_]*(?:Error|Exception|Fault|Warning)):\s*(.*)/);
  if (errMatch) {
    errorType = errMatch[1];
    errorMessage = `${errMatch[1]}: ${errMatch[2].trim()}`;
  }

  // 3. Node/JS line matching if not found
  if (!foundLine) {
    const jsMatches = Array.from(combined.matchAll(/(?:\.cjs|\.js|<anonymous>|workspace):\s*(\d+)(?::\d+)?/gi));
    if (jsMatches.length > 0) {
      foundLine = parseInt(jsMatches[jsMatches.length - 1][1], 10);
    }
  }

  // 4. C++ / C compiler error: workspace.cpp:18:5: error: ...
  if (!foundLine) {
    const cppMatch = combined.match(/(?:\.cpp|\.c|\.h|\.hpp):(\d+):(?:\d+:)?\s*(?:error|fatal error):\s*(.*)/i);
    if (cppMatch) {
      foundLine = parseInt(cppMatch[1], 10);
      errorType = "Compilation Error";
      errorMessage = cppMatch[2].trim();
    }
  }

  // 5. Generic line match fallback (e.g., "line 18", "Line: 18")
  if (!foundLine) {
    const genericMatch = combined.match(/(?:line|Line)\s+(\d+)/);
    if (genericMatch) {
      foundLine = parseInt(genericMatch[1], 10);
    }
  }

  // Extract a clean error message fallback if not set
  if (!errorMessage) {
    const lines = combined.split("\n").map((l) => l.trim()).filter(Boolean);
    // Prefer last non-empty line
    const lastLine = lines[lines.length - 1] || "Execution error encountered";
    errorMessage = lastLine.length > 100 ? lastLine.slice(0, 100) + "..." : lastLine;
  }

  // Look up line author
  let authorName = fallbackAuthor.name || "Collaborator";
  let authorColor = fallbackAuthor.color || "#ef4444";

  if (foundLine && lineAuthors[foundLine]) {
    authorName = lineAuthors[foundLine].userName;
    authorColor = lineAuthors[foundLine].userColor;
  }

  return {
    line: foundLine,
    authorName,
    authorColor,
    errorMessage,
    errorType,
    rawTraceback: combined,
    timestamp: Date.now(),
  };
}
