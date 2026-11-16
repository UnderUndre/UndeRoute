# Baseline Evidence: 006-constitution-wiring-fix

**Captured at**: 2026-11-16T12:38:00+04:00
**Branch**: `006-constitution-wiring-fix` (implementation branch from `main`)
**base-sha (T019 reference)**: `bb2fbb1bae1f10947d97a9d87e7e301a2424dc43`

## 11 Baseline Checks ("Before" State)

1. **`speckit.analyze.md` RTM / XII enforcement**:
   - `grep -cE "RTM|Evidence-Backed|XII" .claude/commands/speckit.analyze.md` → `0`
2. **`AGENTS.md` / `CLAUDE.md` Intent Routing & constitution refs**:
   - `grep -c "Intent Routing" AGENTS.md CLAUDE.md` → `AGENTS.md:0`, `CLAUDE.md:0`
   - `grep -cE "constitution|speckit|/dispatch" AGENTS.md` → `0`
3. **`constitution.md:5` hooks note**:
   - `grep -n "inactive here" .specify/memory/constitution.md` → line 5: `Principle VIII hooks (CC ratchet) are upstream-only and inactive here.`
4. **`constitution.md:135` Principle IX CI cleanup claim**:
   - `grep -n "via CI workflow" .specify/memory/constitution.md` → line 135: `- Branch auto-cleanup targets specs/<slug> branches after merge (via CI workflow).`
5. **`dispatch.md` broken commands & CLAUDE.md refs**:
   - Lines 2, 20, 63, 70 reference `CLAUDE.md`
   - Line 76 references `/brainstorm` (missing; `speckit.brainstorm.md` exists)
   - Line 79 references `/bump` (missing; `speckit.bump.md` exists)
   - `/questions` (FR-006 check against `questions_ideas.md`)
6. **`CLAUDE.md` & `AGENTS.md` Base-green / sweep-reds / `_tasks` refs**:
   - `CLAUDE.md`: lines 36–48 (`Superpowers / planning artifacts — path overrides` table with `_tasks/...`), lines 50–55 (`Base-green before opening PRs` + `.agents/skills/_shared/base-green.md` + `/sweep-reds`)
   - `AGENTS.md`: lines 571–587 (`### Base-green check (PRs must not be born red)`)
7. **`knowledge/patterns/` directory**:
   - `ls -d knowledge/patterns` → `MISSING knowledge/patterns`
8. **`dialog-capture.mjs` hook**:
   - `.claude/hooks/dialog-capture.mjs` exists (1332 bytes), `grep -c "dialog-capture" .claude/settings.json` → `0`
9. **`snapshot-stage.sh` on XII stage names**:
   - `bash .specify/scripts/bash/snapshot-stage.sh requirements-audit 006-constitution-wiring-fix` → `ERROR: invalid stage 'requirements-audit'. Must be one of: spec, clarify, plan, tasks, review, bizplan` (`EXIT=2`)
10. **`intent-hint.sh` CLAUDE.md refs & broken commands**:
    - Line 10: `# Keywords mirror the "Intent Routing" table in CLAUDE.md.`
    - Line 63: `consider \`/brainstorm\``
    - Line 95: `consider \`/bump\``
    - Line 112: `matching CLAUDE.md table`
11. **Baseline line counts (for NFR-001 budget)**:
    - `AGENTS.md`: `712` lines
    - `CLAUDE.md`: `55` lines
    - `.specify/memory/constitution.md`: `248` lines
