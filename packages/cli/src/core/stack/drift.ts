import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "pathe";
import { scanStackManifest } from "./scanner.js";
import { AGENT_FILE_DOMAIN_MAP, resolveDomainSkills } from "./matcher.js";
import { DEFAULT_TECH_SKILL_MATRIX, DOMAIN_BASE_SKILLS } from "./matrix.js";
import type {
  AgentDomain,
  StackDriftFinding,
  StackDriftReport,
  StackManifest,
  TechSkillMapping,
} from "./types.js";

/**
 * Extract declared skills from agent frontmatter
 */
function extractDeclaredSkills(content: string): string[] {
  const match = content.match(/^skills:\s*(.*)$/m);
  if (!match || !match[1]) return [];
  return match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Audit repository agents against detected stack manifest and identify drift
 */
export async function evaluateStackDrift(
  rootDir: string,
  manifest?: StackManifest,
  matrix: TechSkillMapping[] = DEFAULT_TECH_SKILL_MATRIX
): Promise<StackDriftReport> {
  const effectiveManifest = manifest ?? (await scanStackManifest(rootDir));
  const domainSkills = resolveDomainSkills(effectiveManifest, matrix);
  const findings: StackDriftFinding[] = [];
  const detectedSkillsSet = new Set<string>();

  for (const skills of Object.values(domainSkills)) {
    for (const s of skills) detectedSkillsSet.add(s);
  }

  const agentsDir = join(rootDir, ".claude", "agents");
  if (existsSync(agentsDir)) {
    const entries = await readdir(agentsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

      const domain: AgentDomain | undefined = AGENT_FILE_DOMAIN_MAP[entry.name];
      if (!domain) continue;

      const filePath = join(agentsDir, entry.name);
      let content = "";
      try {
        content = await readFile(filePath, "utf-8");
      } catch {
        continue;
      }

      const declaredSkills = extractDeclaredSkills(content);
      const expectedSkills = domainSkills[domain] ?? [];
      const baseSkills = DOMAIN_BASE_SKILLS[domain] ?? [];

      // Check for skill budget ceiling (NFR-003)
      if (declaredSkills.length > 15) {
        findings.push({
          type: "skill_budget",
          severity: "HIGH",
          agentFile: `.claude/agents/${entry.name}`,
          message: `Agent declares ${declaredSkills.length} skills (budget ceiling is 15)`,
          remediation: `Run 'npx clai-helpers sync --update-stack' to prune excess skills`,
        });
      }

      // 1. Check for orphaned skills (declared in agent, but absent from expected skills)
      for (const declared of declaredSkills) {
        // Ignore universal base skills
        if (baseSkills.includes(declared)) continue;

        // If it's a known tech skill from matrix but NOT matched in current manifest -> Orphan!
        const isKnownTechSkill = matrix.some((m) => m.skills.includes(declared));
        if (isKnownTechSkill && !expectedSkills.includes(declared)) {
          findings.push({
            type: "orphaned_skill",
            severity: "HIGH",
            agentFile: `.claude/agents/${entry.name}`,
            skillName: declared,
            message: `Skill '${declared}' declared in ${entry.name} but its technology is missing from dependencies`,
            remediation: `Run 'npx clai-helpers sync --update-stack' to prune orphaned skills`,
          });
        }
      }

      // 2. Check for unmapped frameworks (matched in manifest, but missing from agent)
      for (const expected of expectedSkills) {
        if (!declaredSkills.includes(expected)) {
          findings.push({
            type: "unmapped_framework",
            severity: "HIGH",
            agentFile: `.claude/agents/${entry.name}`,
            skillName: expected,
            message: `Detected stack requires skill '${expected}' in ${entry.name}, but it is missing`,
            remediation: `Run 'npx clai-helpers sync --update-stack' to attach missing skill`,
          });
        }
      }

      // 3. Check for unclosed protected slots (T021)
      const startTags = (content.match(/<!--\s*HELPERS:CUSTOM START.*-->/g) || []).length;
      const endTags = (content.match(/<!--\s*HELPERS:CUSTOM END.*-->/g) || []).length;
      if (startTags !== endTags) {
        findings.push({
          type: "orphaned_skill",
          severity: "HIGH",
          agentFile: `.claude/agents/${entry.name}`,
          message: `Mismatched HELPERS:CUSTOM tags in ${entry.name} (${startTags} START vs ${endTags} END)`,
          remediation: `Ensure every HELPERS:CUSTOM START tag has a matching END tag`,
        });
      }
    }
  }

  const hasDrift = findings.some((f) => f.severity === "CRITICAL" || f.severity === "HIGH");

  return {
    rootDir,
    manifestsDetected: effectiveManifest.markerFiles,
    runtimes: effectiveManifest.runtimes,
    detectedSkills: Array.from(detectedSkillsSet),
    findings,
    hasDrift,
    exitCode: hasDrift ? 2 : 0,
  };
}
