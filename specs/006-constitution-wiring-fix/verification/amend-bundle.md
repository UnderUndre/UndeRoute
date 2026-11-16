# Constitution Amend Bundle Manifest (v1.9.1)

**Governance Rule §2 (ADR-001)**: All amendments to `.specify/memory/constitution.md` and dependent `.claude/` command files MUST land in a **single atomic commit** (`T011` + `T012`).

## Target 1: `.specify/memory/constitution.md` (v1.9.0 → v1.9.1) — 7 edits (6 principle edits + Changelog)

1. **Line 5 (Adaptation Note — FR-005)**:
   - Replace `Principle VIII hooks (CC ratchet) are upstream-only and inactive here.`
   - With truth: `Principle VIII hooks: 6 хуков зарегистрированы в .claude/settings.json с 2026-08-14 (commit f4c87e9099); .claude/ выполняет dual role (см. V).`
2. **Line 11 (Principle I — FR-013)**:
   - Clarify `.gemini/` for UndeRoute: add note that UndeRoute keeps root stub `GEMINI.md` and `.gemini/` target generation is `N/A` here (`.gemini/` directory is not generated in this repo).
3. **Lines 44–51 (Principle V — FR-011)**:
   - Add dual role paragraph: in UndeRoute `.claude/` serves a **dual role** — own AI config + shipped template inventory for `underoute-clai`; the 60-day deletion rule applies to consumer instances, while for the template inventory the criterion is «referenced by any command, agent, or skill in the shipped corpus».
4. **Line 97 (Principle VIII.1 — F2 / FR-005)**:
   - Replace `CLAUDE.md §"Intent Routing"` → `AGENTS.md §"Intent Routing"`.
5. **Line 135 (Principle IX — FR-004)**:
   - Remove ` (via CI workflow)` from `- Branch auto-cleanup targets specs/<slug> branches after merge (via CI workflow).` (cleanup remains manual `git branch -d`).
6. **After Line 186 (New Section `### XIV. Stage Checklists` — FR-008 + FR-012)**:
   - Add `### XIV. Stage Checklists` binding the 9 checklists in `.specify/checklists/` (`accessibility`, `api-contract`, `data-migration`, `i18n`, `operational-readiness`, `performance`, `regulatory-compliance`, `security`, `spike-governance`) to `/speckit.plan` Constitution Check and `/speckit.qa-signoff` (applicability determined per feature in `plan.md`; `operational-readiness.md` required at `/speckit.qa-signoff` for runtime features). Do NOT add Principle XV (FR-012).
7. **Lines 231–235 (Version & Changelog)**:
   - Bump `**Version**: 1.9.1` | `**Last Amended**: 2026-11-16`
   - Prepend `- **1.9.1** (2026-11-16) — ...` changelog entry covering FR-004/005/008/011/013 + VIII.1 routing fix.

**Budget check (NFR-001)**: net addition outside Changelog MUST be ≤ 50 lines (baseline 248 lines).

## Target 2: Dependent `.claude/commands/` (`T012`)

1. **`.claude/commands/speckit.plan.md`**:
   - Step 3 (`Fill Constitution Check section from constitution`): include Principle XIV applicable `.specify/checklists/` selection (9 checklists).
   - Phase 1 Step 3 (`Architecture update`, lines 103–105): replace phantom `§5 CLI Package Layout` / `§6 SpecKit Integration` with actual `specs/main/architecture.md` topology (`## 2. Topography`, `## 4. Stage map`; 46 lines total, `## 1..## 5` — F4).
2. **`.claude/commands/speckit.qa-signoff.md`**:
   - Evaluation gate criteria: verify applicable checklists from Constitution Principle XIV (`.specify/checklists/`, specifically `operational-readiness.md` for runtime features).
