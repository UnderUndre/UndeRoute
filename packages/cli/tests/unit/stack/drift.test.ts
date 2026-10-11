import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { evaluateStackDrift } from "../../../src/core/stack/drift.js";
import type { StackManifest } from "../../../src/core/stack/types.js";

describe("Stack Drift Engine (evaluateStackDrift)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "drift-test-"));
    await mkdir(join(tempDir, ".claude", "agents"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("detects orphaned skill when library is absent from dependencies", async () => {
    // Agent declares prisma-expert, but manifest has drizzle-orm
    const agentContent = `---
name: database-architect
skills: clean-code, database-design, prisma-expert
---
# Database Architect
`;
    await writeFile(
      join(tempDir, ".claude", "agents", "database-architect.md"),
      agentContent,
      "utf-8"
    );

    const manifest: StackManifest = {
      rootDir: tempDir,
      runtimes: ["node"],
      packageManagers: ["npm"],
      dependencies: { "drizzle-orm": "^0.35.0" },
      devDependencies: {},
      markerFiles: ["drizzle.config.ts"],
    };

    const report = await evaluateStackDrift(tempDir, manifest);
    expect(report.hasDrift).toBe(true);
    expect(report.exitCode).toBe(2);

    const orphan = report.findings.find((f) => f.type === "orphaned_skill");
    expect(orphan).toBeDefined();
    expect(orphan?.skillName).toBe("prisma-expert");
  });

  it("returns clean report (exitCode 0) when all skills match stack", async () => {
    const agentContent = `---
name: database-architect
skills: clean-code, database-design
---
# Database Architect
`;
    await writeFile(
      join(tempDir, ".claude", "agents", "database-architect.md"),
      agentContent,
      "utf-8"
    );

    const manifest: StackManifest = {
      rootDir: tempDir,
      runtimes: ["node"],
      packageManagers: ["npm"],
      dependencies: { "drizzle-orm": "^0.35.0" },
      devDependencies: {},
      markerFiles: ["drizzle.config.ts"],
    };

    const report = await evaluateStackDrift(tempDir, manifest);
    expect(report.hasDrift).toBe(false);
    expect(report.exitCode).toBe(0);
    expect(report.findings.length).toBe(0);
  });

  it("flags unmapped framework when key skill is missing from agent", async () => {
    // Manifest has Next.js, but frontend agent only has clean-code
    const agentContent = `---
name: frontend-specialist
skills: clean-code, frontend-design
---
# Frontend Specialist
`;
    await writeFile(
      join(tempDir, ".claude", "agents", "frontend-specialist.md"),
      agentContent,
      "utf-8"
    );

    const manifest: StackManifest = {
      rootDir: tempDir,
      runtimes: ["node"],
      packageManagers: ["pnpm"],
      dependencies: { next: "^15.0.0", react: "^19.0.0" },
      devDependencies: {},
      markerFiles: ["next.config.ts"],
    };

    const report = await evaluateStackDrift(tempDir, manifest);
    expect(report.hasDrift).toBe(true);
    const unmapped = report.findings.find((f) => f.type === "unmapped_framework");
    expect(unmapped).toBeDefined();
    expect(unmapped?.skillName).toBe("nextjs-best-practices");
  });
});
