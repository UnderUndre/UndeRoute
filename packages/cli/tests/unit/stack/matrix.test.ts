import { describe, expect, it } from "vitest";
import { DEFAULT_TECH_SKILL_MATRIX, DOMAIN_BASE_SKILLS } from "../../../src/core/stack/matrix.js";

describe("TechToSkillMatrix", () => {
  it("defines valid base skills for all key domains", () => {
    expect(DOMAIN_BASE_SKILLS.frontend).toContain("clean-code");
    expect(DOMAIN_BASE_SKILLS.backend).toContain("clean-code");
    expect(DOMAIN_BASE_SKILLS.database).toContain("database-design");
    expect(DOMAIN_BASE_SKILLS.test).toContain("testing-patterns");
    expect(DOMAIN_BASE_SKILLS.security).toContain("vulnerability-scanner");
  });

  it("contains expected tech mappings with non-empty skills and targets", () => {
    expect(DEFAULT_TECH_SKILL_MATRIX.length).toBeGreaterThan(5);

    for (const mapping of DEFAULT_TECH_SKILL_MATRIX) {
      expect(mapping.id).toBeTruthy();
      expect(mapping.skills.length).toBeGreaterThan(0);
      expect(mapping.targetAgents.length).toBeGreaterThan(0);

      const hasPackages = mapping.matchers.packages && mapping.matchers.packages.length > 0;
      const hasFiles = mapping.matchers.files && mapping.matchers.files.length > 0;
      expect(hasPackages || hasFiles).toBe(true);
    }
  });

  it("correctly maps Next.js to frontend and backend with nextjs-best-practices", () => {
    const nextMapping = DEFAULT_TECH_SKILL_MATRIX.find((m) => m.id === "nextjs");
    expect(nextMapping).toBeDefined();
    expect(nextMapping?.skills).toContain("nextjs-best-practices");
    expect(nextMapping?.skills).toContain("react-patterns");
    expect(nextMapping?.targetAgents).toContain("frontend");
    expect(nextMapping?.targetAgents).toContain("backend");
  });
});
