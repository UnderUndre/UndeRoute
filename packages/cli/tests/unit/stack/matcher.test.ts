import { describe, expect, it } from "vitest";
import { resolveDomainSkills } from "../../../src/core/stack/matcher.js";
import type { StackManifest } from "../../../src/core/stack/types.js";

describe("Stack Matcher (resolveDomainSkills)", () => {
  it("assigns nextjs and react skills to frontend when next is detected", () => {
    const manifest: StackManifest = {
      rootDir: "/mock",
      runtimes: ["node"],
      packageManagers: ["pnpm"],
      dependencies: { next: "^15.0.0", react: "^19.0.0" },
      devDependencies: {},
      markerFiles: ["next.config.ts"],
    };

    const domainSkills = resolveDomainSkills(manifest);
    expect(domainSkills.frontend).toContain("clean-code"); // base skill
    expect(domainSkills.frontend).toContain("nextjs-best-practices");
    expect(domainSkills.frontend).toContain("react-patterns");
    expect(domainSkills.backend).toContain("nextjs-best-practices");
  });

  it("assigns database-design to database when drizzle-orm is detected", () => {
    const manifest: StackManifest = {
      rootDir: "/mock",
      runtimes: ["node"],
      packageManagers: ["npm"],
      dependencies: { "drizzle-orm": "^0.35.0" },
      devDependencies: {},
      markerFiles: ["drizzle.config.ts"],
    };

    const domainSkills = resolveDomainSkills(manifest);
    expect(domainSkills.database).toContain("database-design");
    expect(domainSkills.database).not.toContain("prisma-expert");
  });

  it("assigns prisma-expert when prisma is detected", () => {
    const manifest: StackManifest = {
      rootDir: "/mock",
      runtimes: ["node"],
      packageManagers: ["npm"],
      dependencies: { "@prisma/client": "^5.0.0" },
      devDependencies: { prisma: "^5.0.0" },
      markerFiles: ["prisma/schema.prisma"],
    };

    const domainSkills = resolveDomainSkills(manifest);
    expect(domainSkills.database).toContain("prisma-expert");
  });

  it("deduplicates skills and enforces clean array structure", () => {
    const manifest: StackManifest = {
      rootDir: "/mock",
      runtimes: ["node"],
      packageManagers: ["npm"],
      dependencies: { next: "^15.0.0", react: "^19.0.0", tailwindcss: "^3.4.0" },
      devDependencies: {},
      markerFiles: [],
    };

    const domainSkills = resolveDomainSkills(manifest);
    const frontendSkills = domainSkills.frontend;
    const uniqueSkills = Array.from(new Set(frontendSkills));
    expect(frontendSkills.length).toBe(uniqueSkills.length);
  });
});
