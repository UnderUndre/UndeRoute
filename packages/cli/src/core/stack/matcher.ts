import { DEFAULT_TECH_SKILL_MATRIX, DOMAIN_BASE_SKILLS } from "./matrix.js";
import type { AgentDomain, StackManifest, TechSkillMapping } from "./types.js";

export const AGENT_FILE_DOMAIN_MAP: Record<string, AgentDomain> = {
  "frontend-specialist.md": "frontend",
  "backend-specialist.md": "backend",
  "database-architect.md": "database",
  "test-engineer.md": "test",
  "devops-engineer.md": "devops",
  "security-auditor.md": "security",
  "mobile-developer.md": "mobile",
  "seo-specialist.md": "seo",
  "ui-ux-pro-max.md": "uiux",
  "game-developer.md": "game",
  // Speckit prefix support
  "speckit.frontend-specialist.md": "frontend",
  "speckit.backend-specialist.md": "backend",
  "speckit.database-architect.md": "database",
  "speckit.test-engineer.md": "test",
  "speckit.devops-engineer.md": "devops",
  "speckit.security-auditor.md": "security",
  "speckit.seo-specialist.md": "seo",
  "speckit.ui-ux-pro-max.md": "uiux",
};

/**
 * Resolve effective skills for each domain based on detected stack manifest
 */
export function resolveDomainSkills(
  manifest: StackManifest,
  matrix: TechSkillMapping[] = DEFAULT_TECH_SKILL_MATRIX
): Record<AgentDomain, string[]> {
  const result: Record<AgentDomain, Set<string>> = {
    frontend: new Set(DOMAIN_BASE_SKILLS.frontend),
    backend: new Set(DOMAIN_BASE_SKILLS.backend),
    database: new Set(DOMAIN_BASE_SKILLS.database),
    test: new Set(DOMAIN_BASE_SKILLS.test),
    devops: new Set(DOMAIN_BASE_SKILLS.devops),
    security: new Set(DOMAIN_BASE_SKILLS.security),
    mobile: new Set(DOMAIN_BASE_SKILLS.mobile),
    seo: new Set(DOMAIN_BASE_SKILLS.seo),
    uiux: new Set(DOMAIN_BASE_SKILLS.uiux),
    game: new Set(DOMAIN_BASE_SKILLS.game),
  };

  const allPackages = new Set([
    ...Object.keys(manifest.dependencies),
    ...Object.keys(manifest.devDependencies),
  ]);
  const markerFiles = new Set(manifest.markerFiles);

  for (const mapping of matrix) {
    let matched = false;

    // Check package matchers
    if (mapping.matchers.packages) {
      for (const pkg of mapping.matchers.packages) {
        if (allPackages.has(pkg)) {
          matched = true;
          break;
        }
      }
    }

    // Check file matchers
    if (!matched && mapping.matchers.files) {
      for (const file of mapping.matchers.files) {
        if (markerFiles.has(file)) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      for (const target of mapping.targetAgents) {
        if (result[target]) {
          for (const skill of mapping.skills) {
            result[target].add(skill);
          }
        }
      }
    }
  }

  // Convert Sets to Arrays, enforcing budget limit (<= 15 skills per agent)
  const finalMapping: Record<AgentDomain, string[]> = {} as any;
  for (const domain of Object.keys(result) as AgentDomain[]) {
    finalMapping[domain] = Array.from(result[domain]).slice(0, 15);
  }

  return finalMapping;
}

/**
 * Update the `skills:` frontmatter entry of an agent markdown file safely
 */
export function injectSkillsIntoFrontmatter(content: string, skills: string[]): string {
  const skillsLine = `skills: ${skills.join(", ")}`;

  // Matches `skills: ...` inside YAML frontmatter
  if (/^skills:\s*.*$/m.test(content)) {
    return content.replace(/^skills:\s*.*$/m, skillsLine);
  }

  // If no skills field exists, insert before the closing frontmatter delimiter `---`
  return content.replace(/^---\s*$/m, (match, offset) => {
    // Only insert if this is the second `---` (end of frontmatter)
    const firstDelimiter = content.indexOf("---");
    if (offset > firstDelimiter) {
      return `${skillsLine}\n---`;
    }
    return match;
  });
}
