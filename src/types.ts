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
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  role?: "teacher" | "student";
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

// STEM Lab / Simulation Challenge
export interface STEMTestCase {
  id: string;
  description: string;
  input: string;
  expectedOutput: string;
  passed?: boolean;
  actualOutput?: string;
}

export interface STEMLab {
  id: string;
  title: string;
  discipline: "physics" | "mathematics" | "chemistry" | "robotics" | "algorithms";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  theoryFormula: string;
  learningObjectives: string[];
  starterCode: Record<string, string>;
  testCases: STEMTestCase[];
  simulationType?: "projectile" | "riemann" | "dna" | "pid" | "circuit";
  hints: string[];
}

// Collaborative Debugging Hypothesis
export interface DebuggingHypothesis {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  lineTarget?: number;
  status: "investigating" | "confirmed" | "resolved" | "dismissed";
  timestamp: number;
  upvotes: number;
  upvotedBy: string[];
}

// Beginner AI Syntax Assistance
export interface BeginnerSyntaxHelp {
  errorType: string;
  friendlyTitle: string;
  line?: number;
  explanation: string;
  analogy: string;
  whyItHappened: string;
  howToFix: string;
  suggestedFixSnippet?: string;
  practiceQuiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

// Automated Code Quality Analysis
export interface CodeQualityMetricBreakdown {
  score: number;
  efficiency: number; // Big-O / speed
  readability: number; // Variable naming, structure
  modularity: number; // Function decomposition
  robustness: number; // Error & edge cases
  stemDocumentation: number; // Formula comments & docstrings
}

export interface CodeQualityIssue {
  type: "syntax" | "performance" | "style" | "security" | "edge-case";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  line?: number;
  suggestedCorrection?: string;
}

export interface FullCodeQualityReport {
  overallScore: number;
  verdict: string;
  metrics: CodeQualityMetricBreakdown;
  bigOComplexity: {
    time: string;
    space: string;
    explanation: string;
  };
  strengths: string[];
  issues: CodeQualityIssue[];
  refactoredCode?: string;
}

// Personalized Learning Progress
export interface STEMStudentProgress {
  userId: string;
  userName: string;
  completedLabs: string[];
  streakDays: number;
  totalRuns: number;
  errorsResolved: number;
  conceptsMastered: string[];
  skillScores: {
    physicsMath: number; // 0-100
    algorithmicThinking: number; // 0-100
    syntaxPrecision: number; // 0-100
    debuggingPersistence: number; // 0-100
    codeElegance: number; // 0-100
  };
  badges: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
    unlockedAt?: number;
  }>;
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
  activeStemLab?: STEMLab | null;
  hypotheses?: DebuggingHypothesis[];
  sharedBreakpoints?: number[];
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
  | "ocean-cream"
  | "vs-dark"
  | "monokai"
  | "dracula"
  | "github-dark"
  | "solarized-dark"
  | "twilight";
