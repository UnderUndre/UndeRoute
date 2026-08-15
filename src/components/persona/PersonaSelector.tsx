import React from "react";
import { PersonaThemeDefinition } from "../../themes/theme-engine";

interface PersonaSelectorProps {
  themes: PersonaThemeDefinition[];
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  themes,
  activeThemeId,
  onSelectTheme,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-800">
      {themes.map((theme) => {
        const isActive = theme.id === activeThemeId;
        return (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
              isActive
                ? "ring-2 ring-offset-1 ring-offset-slate-950 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            style={{
              backgroundColor: isActive ? theme.primaryColor : undefined,
              boxShadow: isActive ? `0 0 12px ${theme.primaryColor}80` : undefined,
            }}
          >
            <span>{theme.name}</span>
          </button>
        );
      })}
    </div>
  );
};
