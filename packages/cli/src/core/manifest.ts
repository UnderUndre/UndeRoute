/**
 * Manifest loader via c12 per contracts/manifest.md.
 * Loads helpers.config.ts from the source repo.
 */

import { loadConfig } from "c12";
import type { HelpersConfig } from "../types/config.js";

/**
 * Identity helper for type-safe manifest authoring.
 * Usage: `export default defineHelpersConfig({ ... })`
 */
export function defineHelpersConfig(config: HelpersConfig): HelpersConfig {
  return config;
}

/**
 * Load and validate manifest from source directory.
 */
export async function loadManifest(
  sourceDir: string,
  overridePath?: string
): Promise<HelpersConfig> {
  const { config } = await loadConfig<HelpersConfig>({
    cwd: sourceDir,
    name: "helpers",
    configFile: overridePath,
  });

  let manifest = config as HelpersConfig;
  if (!manifest || !manifest.sources || manifest.sources.length === 0) {
    manifest = {
      version: 1,
      sources: [
        ".claude/**/*",
        "commands/**/*.md",
        "agents/**/*.md",
        "CLAUDE.md",
        "AGENTS.md",
        "settings.json",
        ".specify/**/*",
      ],
      targets: {
        claude: {
          pipelines: [
            {
              transformer: "identity",
              match: ".claude/**/*",
              output: "{{relativePath}}",
            },
            {
              transformer: "identity",
              match: "commands/**/*.md",
              output: ".claude/commands/{{name}}.md",
            },
            {
              transformer: "identity",
              match: "agents/**/*.md",
              output: ".claude/agents/{{name}}.md",
            },
            {
              transformer: "identity",
              match: "settings.json",
              output: ".claude/settings.json",
            },
            {
              transformer: "identity",
              match: "CLAUDE.md",
              output: "CLAUDE.md",
            },
            {
              transformer: "identity",
              match: "AGENTS.md",
              output: "AGENTS.md",
            },
          ],
        },
        copilot: {
          pipelines: [
            {
              transformer: "claude-to-copilot-prompt",
              match: ".claude/commands/**/*.md",
              output: ".github/prompts/{{name}}.prompt.md",
            },
            {
              transformer: "claude-to-copilot-prompt",
              match: "commands/**/*.md",
              output: ".github/prompts/{{name}}.prompt.md",
            },
            {
              transformer: "claude-to-copilot-instructions",
              match: ".claude/agents/**/*.md",
              output: ".github/instructions/{{name}}.instructions.md",
            },
            {
              transformer: "claude-to-copilot-instructions",
              match: "agents/**/*.md",
              output: ".github/instructions/{{name}}.instructions.md",
            },
            {
              transformer: "claude-to-copilot-root-instructions",
              match: "CLAUDE.md",
              output: ".github/copilot-instructions.md",
            },
          ],
        },
        gemini: {
          pipelines: [
            {
              transformer: "claude-to-gemini-command",
              match: ".claude/commands/**/*.md",
              output: ".gemini/commands/{{name}}.toml",
            },
            {
              transformer: "claude-to-gemini-command",
              match: "commands/**/*.md",
              output: ".gemini/commands/{{name}}.toml",
            },
            {
              transformer: "claude-to-gemini-agent",
              match: ".claude/agents/**/*.md",
              output: ".gemini/agents/{{name}}.md",
            },
            {
              transformer: "claude-to-gemini-agent",
              match: "agents/**/*.md",
              output: ".gemini/agents/{{name}}.md",
            },
            {
              transformer: "claude-to-gemini-root",
              match: "CLAUDE.md",
              output: "GEMINI.md",
            },
          ],
        },
        speckit: {
          pipelines: [
            {
              transformer: "identity",
              match: ".specify/**/*",
              output: "{{relativePath}}",
            },
          ],
        },
      },
    };
  }

  validateManifest(manifest);
  return manifest;
}

function validateManifest(manifest: HelpersConfig): void {
  if (manifest.version !== 1) {
    throw new Error(`Manifest version ${manifest.version} is not supported. Expected 1.`);
  }

  if (!manifest.sources || manifest.sources.length === 0) {
    throw new Error("Manifest must have at least one source pattern.");
  }

  const targetNames = Object.keys(manifest.targets);
  if (targetNames.length === 0) {
    throw new Error("Manifest must have at least one target.");
  }

  // Check for duplicate output paths across all targets
  const outputPaths = new Set<string>();
  for (const [targetName, target] of Object.entries(manifest.targets)) {
    for (const pipeline of target.pipelines) {
      // Validate match is subset of sources (simple check: at least one source pattern could match)
      const matchesAny = manifest.sources.some((src) => patternsOverlap(src, pipeline.match));
      if (!matchesAny) {
        throw new Error(
          `Pipeline match "${pipeline.match}" in target "${targetName}" is not covered by any source pattern.`
        );
      }

      // Check output template variables
      const validVars = /\{\{(name|relativePath|subpath|ext)\}\}/g;
      const stripped = pipeline.output.replace(validVars, "");
      const invalidVars = stripped.match(/\{\{(\w+)\}\}/);
      if (invalidVars) {
        throw new Error(
          `Invalid template variable "{{${invalidVars[1]}}}" in output "${pipeline.output}" of target "${targetName}".`
        );
      }

      // Only flag duplicates for literal output paths (no template variables).
      // Templates with {{name}}, {{relativePath}}, etc. produce different paths per source file.
      const hasTemplateVars = /\{\{(name|relativePath|subpath|ext)\}\}/.test(pipeline.output);
      if (!hasTemplateVars) {
        if (outputPaths.has(pipeline.output)) {
          throw new Error(`Duplicate output path: "${pipeline.output}" across targets.`);
        }
        outputPaths.add(pipeline.output);
      }
    }
  }
}

/**
 * Simple heuristic: two glob patterns might overlap if they share a common base.
 * This is not a full glob intersection check — it catches obvious mismatches.
 */
function patternsOverlap(source: string, match: string): boolean {
  // "**/*" matches everything
  if (source === "**/*" || match === "**/*") return true;
  if (source === match) return true;

  // Check if the directory prefix matches
  const sourceBase = source.split("/")[0];
  const matchBase = match.split("/")[0];

  if (sourceBase === "**" || matchBase === "**") return true;
  if (sourceBase === matchBase) return true;

  // Single file patterns
  if (!source.includes("*") && !match.includes("*")) {
    return source === match;
  }

  return false;
}
