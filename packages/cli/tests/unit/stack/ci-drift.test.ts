import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { evaluateStackDrift } from "../../../src/core/stack/drift.js";

describe("CI Stack Drift Linter Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "ci-drift-test-"));
    await mkdir(join(tempDir, ".claude", "agents"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("exits with code 2 when project dependencies and agent skills diverge", async () => {
    // Project uses Fastify + Python, but agent declares nextjs
    const agentContent = `---
name: backend-specialist
skills: clean-code, nextjs-best-practices
---
# Backend Specialist
`;
    await writeFile(
      join(tempDir, ".claude", "agents", "backend-specialist.md"),
      agentContent,
      "utf-8"
    );

    const pkgJson = {
      dependencies: {
        fastify: "^4.0.0",
      },
    };
    await writeFile(join(tempDir, "package.json"), JSON.stringify(pkgJson), "utf-8");

    const report = await evaluateStackDrift(tempDir);
    expect(report.hasDrift).toBe(true);
    expect(report.exitCode).toBe(2);

    // Finding 1: nextjs-best-practices is orphaned
    expect(report.findings.some((f) => f.skillName === "nextjs-best-practices")).toBe(true);
    // Finding 2: nodejs-best-practices is unmapped
    expect(report.findings.some((f) => f.skillName === "nodejs-best-practices")).toBe(true);
  });
});
