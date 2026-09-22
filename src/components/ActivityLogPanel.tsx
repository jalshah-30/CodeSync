import React from "react";
import { Activity, Clock, Edit3, Play, UserPlus, LogOut, Code, Sparkles } from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityLogPanelProps {
  logs: ActivityLog[];
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ logs }) => {
  const getActionIcon = (action: string) => {
    if (action.includes("joined") || action.includes("created")) {
      return <UserPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    if (action.includes("left")) {
      return <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
    if (action.includes("ran") || action.includes("executed")) {
      return <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (action.includes("AI") || action.includes("auto-fixed")) {
      return <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (action.includes("switched")) {
      return <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
    return <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-950/60 select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Activity Log</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
            {logs.length}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Real-Time</span>
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {logs.slice().reverse().map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition"
          >
            <div className="mt-0.5">{getActionIcon(log.action)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  style={{ color: log.userColor || "#38bdf8" }}
                  className="font-semibold text-[11px] truncate"
                >
                  {log.userName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                {log.action}
              </p>
              {log.details && (
                <p className="text-slate-400 text-[10px] font-mono mt-0.5 bg-black/40 p-1 rounded">
                  {log.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
