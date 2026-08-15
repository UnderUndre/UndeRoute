import { PersonaThemeDefinition } from "../theme-engine";
import { PERSONA_SYSTEM_PROMPTS } from "../persona-prompts";

export const narutoTheme: PersonaThemeDefinition = {
  id: "naruto",
  name: "Наруто (Kurama Edition)",
  primaryColor: "#FF5500",
  backgroundColor: "#0D0B0E",
  accentColor: "#FF0033",
  systemPrompt: PERSONA_SYSTEM_PROMPTS.naruto,
  sfxSend: "assets/naruto/sfx_kunai.wav",
  sfxSuccess: "assets/naruto/sfx_rasengan_success.mp3",
  sfxError: "assets/naruto/sfx_clone_poof.mp3",
  videoOverlay: "assets/naruto/video_chakra_aura.webm",
  cssClass: "theme-naruto",
};
