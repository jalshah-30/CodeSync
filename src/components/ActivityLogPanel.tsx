import React from "react";
import { Activity, Clock, Edit3, Play, UserPlus, LogOut, Code, Sparkles } from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityLogPanelProps {
  logs: ActivityLog[];
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ logs }) => {
  const getActionIcon = (action: string) => {
    if (action.includes("joined") || action.includes("created")) {
      return <UserPlus className="w-3.5 h-3.5 text-[#0DCC5C] shrink-0" />;
    }
    if (action.includes("left")) {
      return <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
    if (action.includes("ran") || action.includes("executed")) {
      return <Play className="w-3.5 h-3.5 text-[#0DCC5C] shrink-0" />;
    }
    if (action.includes("AI") || action.includes("auto-fixed")) {
      return <Sparkles className="w-3.5 h-3.5 text-[#0DCC5C] shrink-0" />;
    }
    if (action.includes("switched")) {
      return <Code className="w-3.5 h-3.5 text-[#0DCC5C] shrink-0" />;
    }
    return <Edit3 className="w-3.5 h-3.5 text-[#7F867F] shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#17191A] border-0 text-xs text-[#FFFFFF]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2021] bg-[#121416] select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0DCC5C]" />
          <span className="font-bold text-[#FFFFFF] text-xs">Activity Log</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#202224] text-[10px] font-bold text-[#0DCC5C] border border-[#1E2021]">
            {logs.length}
          </span>
        </div>
        <span className="text-[11px] text-[#7F867F] flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3 text-[#7F867F]" />
          <span>Real-Time</span>
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#07090A]">
        {logs.slice().reverse().map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#17191A] border border-[#1E2021] hover:border-[#39393B] hover:bg-[#202224] transition shadow-xs"
          >
            <div className="mt-0.5 p-1.5 rounded-full bg-[#202224] border border-[#1E2021] shrink-0">
              {getActionIcon(log.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  style={{ color: log.userColor || "#FFFFFF" }}
                  className="font-bold text-xs truncate"
                >
                  {log.userName}
                </span>
                <span className="text-[10px] text-[#7F867F] font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-[#FFFFFF] text-xs leading-snug font-medium">
                {log.action}
              </p>
              {log.details && (
                <p className="text-[#7F867F] text-[11px] font-mono mt-1 bg-[#202224] border border-[#1E2021] p-1.5 rounded-lg">
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
