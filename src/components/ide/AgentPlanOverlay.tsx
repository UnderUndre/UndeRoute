import React from "react";

interface AgentPlanOverlayProps {
  mode: "PLAN" | "ACT";
  pendingToolName?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onSwitchMode?: (mode: "PLAN" | "ACT") => void;
}

export const AgentPlanOverlay: React.FC<AgentPlanOverlayProps> = ({
  mode,
  pendingToolName,
  onApprove,
  onReject,
  onSwitchMode,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-t border-slate-800 backdrop-blur text-xs">
      <div className="flex items-center gap-3">
        <span className="font-mono text-slate-400">Execution Mode:</span>
        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => onSwitchMode?.("PLAN")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              mode === "PLAN" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            PLAN (Read-Only)
          </button>
          <button
            onClick={() => onSwitchMode?.("ACT")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              mode === "ACT" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ACT (Read-Write)
          </button>
        </div>
      </div>

      {pendingToolName && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded">
          <span className="text-amber-300 font-mono">
            HITL Approval Required: <strong>{pendingToolName}</strong>
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={onReject}
              className="px-2 py-0.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded font-semibold text-[10px]"
            >
              Deny
            </button>
            <button
              onClick={onApprove}
              className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-semibold text-[10px]"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
