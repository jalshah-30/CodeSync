import React from "react";
import {
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCircle,
  BarChart3,
  Download,
  X,
} from "lucide-react";
import { STEMStudentProgress } from "../types";

interface LearnerProgressModalProps {
  progress: STEMStudentProgress;
  onClose: () => void;
  onSelectRecommendedLab?: (labId: string) => void;
}

export const LearnerProgressModal: React.FC<LearnerProgressModalProps> = ({
  progress,
  onClose,
}) => {
  const handleExportCertificate = () => {
    const reportData = {
      student: progress.userName,
      platform: "CodeSync Collaborative Studio",
      date: new Date().toLocaleDateString(),
      completedLabs: progress.completedLabs,
      skills: progress.skillScores,
      streakDays: progress.streakDays,
      totalRuns: progress.totalRuns,
      badges: progress.badges.map((b) => b.title),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Learning_Journey_${progress.userName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#000000]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1E2021] bg-[#17191A] p-6 shadow-2xl text-[#FFFFFF] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full border border-[#292C2D] bg-[#202224] text-[#7F867F] hover:text-[#FFFFFF] hover:bg-[#292C2D] transition"
          title="Close journey modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-[#1E2021]">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#0DCC5C] text-[#03110A] flex items-center justify-center font-extrabold text-xl shadow-md">
              {progress.userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">{progress.userName}</h2>
                <span className="px-3 py-0.5 rounded-full bg-[#202224] text-[#0DCC5C] text-[11px] font-semibold border border-[#292C2D]">
                  Active Explorer 🚀
                </span>
              </div>
              <p className="text-xs text-[#7F867F] mt-0.5">Your personal STEM learning journey & discovery portfolio</p>
            </div>
          </div>

          <button
            onClick={handleExportCertificate}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#292C2D] bg-[#202224] hover:bg-[#292C2D] text-xs font-semibold text-[#FFFFFF] transition active:scale-95 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7F867F]" />
            <span>Save Learning Summary</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 rounded-2xl border border-[#1E2021] bg-[#202224] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#7F867F] mb-1">
              <span className="text-xs font-medium">Daily Streak</span>
              <Flame className="w-4 h-4 text-[#0DCC5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FFFFFF]">{progress.streakDays} Days</div>
            <span className="text-[11px] font-semibold text-[#7F867F] mt-1">Coding Consistently</span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1E2021] bg-[#202224] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#7F867F] mb-1">
              <span className="text-xs font-medium">Completed</span>
              <Trophy className="w-4 h-4 text-[#0DCC5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FFFFFF]">{progress.completedLabs.length} Labs</div>
            <span className="text-[11px] font-semibold text-[#7F867F] mt-1">Hands-on Projects</span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1E2021] bg-[#202224] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#7F867F] mb-1">
              <span className="text-xs font-medium">Code Runs</span>
              <Zap className="w-4 h-4 text-[#0DCC5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FFFFFF]">{progress.totalRuns}</div>
            <span className="text-[11px] font-semibold text-[#7F867F] mt-1">Experiments Tested</span>
          </div>

          <div className="p-4 rounded-2xl border border-[#1E2021] bg-[#202224] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#7F867F] mb-1">
              <span className="text-xs font-medium">Bugs Solved</span>
              <CheckCircle className="w-4 h-4 text-[#0DCC5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FFFFFF]">{progress.errorsResolved}</div>
            <span className="text-[11px] font-semibold text-[#7F867F] mt-1">Problem-Solving Wins</span>
          </div>
        </div>

        {/* Skill Growth Breakdown */}
        <div className="rounded-2xl border border-[#1E2021] bg-[#202224] p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#FFFFFF]">
              <BarChart3 className="w-4 h-4 text-[#0DCC5C]" />
              <span>Skill Progress Portfolio</span>
            </div>
            <span className="text-xs text-[#7F867F]">Continuous assessment</span>
          </div>

          <div className="space-y-4">
            {[
              { label: "Math & Physics Intuition", score: progress.skillScores.physicsMath },
              { label: "Problem Solving & Logic", score: progress.skillScores.algorithmicThinking },
              { label: "Syntax Mastery & Care", score: progress.skillScores.syntaxPrecision },
              { label: "Collaborative Debugging & Teamwork", score: progress.skillScores.debuggingPersistence },
              { label: "Code Readability & Structure", score: progress.skillScores.codeElegance },
            ].map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-[#FFFFFF]">
                  <span>{skill.label}</span>
                  <span className="font-mono font-bold text-[#0DCC5C]">{skill.score}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#17191A] border border-[#292C2D] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0DCC5C] transition-all duration-700 shadow-[0_0_12px_rgba(13,204,92,0.4)]"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="rounded-2xl border border-[#1E2021] bg-[#202224] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#FFFFFF]">
              <Award className="w-4 h-4 text-[#0DCC5C]" />
              <span>Unlocked Milestones</span>
            </div>
            <span className="text-xs text-[#7F867F]">{progress.badges.length} Badges Earned</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {progress.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3.5 rounded-xl border border-[#1E2021] bg-[#17191A] flex items-center gap-3 transition hover:border-[#292C2D]"
              >
                <div className="text-2xl shrink-0 p-2 rounded-xl bg-[#202224] border border-[#292C2D] shadow-xs">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#FFFFFF]">{badge.title}</h4>
                  <p className="text-[11px] text-[#7F867F] leading-tight mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
