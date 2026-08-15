import React from "react";
import { DiffEditor } from "@monaco-editor/react";

interface MonacoDiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language = "typescript",
  onAccept,
  onReject,
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-300">Git Diff Review ({language})</span>
        <div className="flex gap-2">
          {onReject && (
            <button
              onClick={onReject}
              className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded text-xs font-semibold"
            >
              Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="px-3 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded text-xs font-semibold"
            >
              Accept Diff
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
};
