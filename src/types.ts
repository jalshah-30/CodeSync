export interface LineAuthor {
  line: number;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  lastEditSummary?: string;
}

export interface ErrorAttribution {
  line?: number;
  authorName: string;
  authorColor: string;
  errorMessage: string;
  errorType?: string;
  rawTraceback?: string;
  timestamp: number;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  socketId?: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
  joinedAt?: number;
  cursor?: {
    line: number;
    ch: number;
    timestamp: number;
  };
}

export interface CursorPosition {
  line: number;
  ch: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface ActivityLog {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userColor?: string;
  action: string;
  details?: string;
  timestamp: number;
}

export interface RoomDetails {
  id: string;
  name: string;
  language: string;
  code: string;
  input: string;
  output: string;
  executionStatus: "idle" | "running" | "success" | "error";
  executionTime?: string;
  hasPassword?: boolean;
  members: Collaborator[];
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  lineAuthors?: Record<number, LineAuthor>;
  errorAttribution?: ErrorAttribution | null;
  createdAt?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: "success" | "error";
  time: string;
  output: string;
  errorAttribution?: ErrorAttribution | null;
}

export interface AIDebugResult {
  summary: string;
  rootCause: string;
  fixedCode: string;
  changesMade: string[];
}

export interface AICodeReview {
  overallScore: number;
  verdict: string;
  strengths: string[];
  improvements: Array<{
    type: "performance" | "style" | "security";
    title: string;
    description: string;
  }>;
  improvedCode?: string;
}

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "cpp"
  | "java"
  | "go"
  | "rust"
  | "html"
  | "css"
  | "sql"
  | "bash";

export type EditorTheme =
  | "vs-dark"
  | "monokai"
  | "dracula"
  | "github-dark"
  | "solarized-dark"
  | "twilight";
