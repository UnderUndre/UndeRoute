export interface PersonaThemeDefinition {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  systemPrompt: string;
  sfxSend: string;
  sfxSuccess: string;
  sfxError: string;
  videoOverlay?: string;
  cssClass: string;
}

export class ThemeEngine {
  private themes: Map<string, PersonaThemeDefinition> = new Map();
  private currentThemeId: string = "naruto";

  public registerTheme(theme: PersonaThemeDefinition): void {
    this.themes.set(theme.id, theme);
  }

  public activeTheme(): PersonaThemeDefinition {
    return this.themes.get(this.currentThemeId) || this.themes.values().next().value;
  }

  public setTheme(themeId: string): PersonaThemeDefinition {
    if (!this.themes.has(themeId)) {
      throw new Error(`Theme ${themeId} is not registered`);
    }
    this.currentThemeId = themeId;
    return this.activeTheme();
  }

  public listThemes(): PersonaThemeDefinition[] {
    return Array.from(this.themes.values());
  }
}
