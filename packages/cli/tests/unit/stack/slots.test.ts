import { describe, expect, it } from "vitest";
import { injectSkillsIntoFrontmatter } from "../../../src/core/stack/matcher.js";

describe("Protected Slots Preservation (User Story 3)", () => {
  it("preserves HELPERS:CUSTOM START: STACK_RULES intact when skills frontmatter is updated", () => {
    const original = `---
name: backend-specialist
skills: clean-code
---

# Backend Specialist

<!-- HELPERS:CUSTOM START: STACK_RULES -->
- Все входящие API-запросы строго валидируются через Zod-схему.
- При работе с БД использовать только адаптер open-sse.
<!-- HELPERS:CUSTOM END: STACK_RULES -->

## Workflow
Follow layered architecture.
`;

    const updated = injectSkillsIntoFrontmatter(original, [
      "clean-code",
      "api-patterns",
      "nodejs-best-practices",
    ]);

    // Frontmatter updated
    expect(updated).toContain("skills: clean-code, api-patterns, nodejs-best-practices");

    // Slot preserved byte-for-byte
    expect(updated).toContain("<!-- HELPERS:CUSTOM START: STACK_RULES -->");
    expect(updated).toContain("- Все входящие API-запросы строго валидируются через Zod-схему.");
    expect(updated).toContain("- При работе с БД использовать только адаптер open-sse.");
    expect(updated).toContain("<!-- HELPERS:CUSTOM END: STACK_RULES -->");
    expect(updated).toContain("## Workflow");
  });

  it("preserves other content and comments when frontmatter is updated", () => {
    const original = `---
name: database-architect
skills: clean-code
---

> "Тяжесть — это надёжно." — Борис Бритва

## Mindset
Data integrity is sacred.
`;

    const updated = injectSkillsIntoFrontmatter(original, ["clean-code", "database-design"]);

    expect(updated).toContain("skills: clean-code, database-design");
    expect(updated).toContain('> "Тяжесть — это надёжно." — Борис Бритва');
    expect(updated).toContain("## Mindset");
  });
});
