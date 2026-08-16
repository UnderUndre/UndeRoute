/**
 * ANSI Escape Sequence Stripper & Formatter
 * Sanitizes stdout/stderr streams from spawned CLI agents (Claude Code, Aider, OpenCode)
 * before rendering clean Markdown in the chat UI.
 */

// Regex matching control characters & ANSI escape sequences
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const CARRIAGE_RETURN_REGEX = /\r\n?/g;

export class AnsiSanitizer {
  public static stripAnsi(input: string): string {
    if (!input) return "";
    return input.replace(ANSI_REGEX, "").replace(CARRIAGE_RETURN_REGEX, "\n");
  }

  public static formatForChat(rawOutput: string): string {
    const cleanText = this.stripAnsi(rawOutput);
    // Wrap raw terminal logs cleanly if not already markdown
    if (!cleanText.startsWith("```")) {
      return cleanText;
    }
    return cleanText;
  }
}
