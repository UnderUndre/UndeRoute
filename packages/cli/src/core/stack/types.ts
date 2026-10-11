/**
 * Types for Stack-Aware Agent Fleet Synchronization
 *
 * @see specs/003-stack-aware-agents/data-model.md
 */

export type SupportedRuntime = "node" | "bun" | "deno" | "python" | "go" | "rust";

export type SupportedPackageManager =
  "npm" | "pnpm" | "yarn" | "bun" | "poetry" | "pip" | "cargo" | "gomod";

export type AgentDomain =
  | "frontend"
  | "backend"
  | "database"
  | "test"
  | "devops"
  | "security"
  | "mobile"
  | "seo"
  | "uiux"
  | "game";

/**
 * Representation of detected tech stack in a repository
 */
export interface StackManifest {
  readonly rootDir: string;
  readonly runtimes: SupportedRuntime[];
  readonly packageManagers: SupportedPackageManager[];
  readonly dependencies: Record<string, string>;
  readonly devDependencies: Record<string, string>;
  readonly markerFiles: string[];
}

/**
 * Matcher definition for a specific library or framework
 */
export interface TechSkillMapping {
  readonly id: string;
  readonly matchers: {
    readonly packages?: string[];
    readonly files?: string[];
  };
  readonly skills: string[];
  readonly targetAgents: AgentDomain[];
  readonly description: string;
}

/**
 * Dynamic skill binding for an individual agent
 */
export interface AgentSkillBinding {
  readonly agentFile: string;
  readonly domain: AgentDomain;
  readonly baseSkills: string[];
  readonly detectedSkills: string[];
  readonly effectiveSkills: string[];
}

/**
 * Structural finding for stack drift audit
 */
export interface StackDriftFinding {
  readonly type: "orphaned_skill" | "unmapped_framework" | "outdated_version" | "skill_budget";
  readonly severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  readonly agentFile?: string;
  readonly skillName?: string;
  readonly packageName?: string;
  readonly message: string;
  readonly remediation: string;
}

/**
 * Structured report from stack drift audit
 */
export interface StackDriftReport {
  readonly rootDir: string;
  readonly manifestsDetected: string[];
  readonly runtimes: SupportedRuntime[];
  readonly detectedSkills: string[];
  readonly findings: StackDriftFinding[];
  readonly hasDrift: boolean;
  readonly exitCode: 0 | 2;
}
