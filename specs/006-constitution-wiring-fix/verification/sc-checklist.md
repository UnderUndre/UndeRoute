# Final Verification Checklist (SC-001..005 & 18/18 RTM AC): 006-constitution-wiring-fix

**Verified at**: 2026-11-16T12:46:00+04:00
**Branch**: `006-constitution-wiring-fix`
**Base SHA (`T019`)**: `bb2fbb1bae1f10947d97a9d87e7e301a2424dc43`
**Verified Commit (pre-T018)**: `d5ccc6ffbd`

## 1. Requirements Verification (18/18 PASS)

| Req ID | Check | Result | Raw Evidence / Metric |
| --- | --- | --- | --- |
| FR-001 | `speckit.analyze.md` §2 QA artifacts + §D RTM/XII.4 + waiver fallback + `- \[[xX]\] T\d+` | PASS | `grep -cE "RTM\|Evidence-Backed\|preliminary-rtm\|qa/waiver"` = `4` (lines 88–89, 130–131) |
| FR-002 | `AGENTS.md` `## Intent Routing` + Precedence + `intent-hint.sh` (`:10,:63,:95,:112`) | PASS | `AGENTS.md`: 1 routing section, 1 precedence block (+27 lines added, +9 net); `intent-hint.sh`: `CLAUDE.md`=`0`, `AGENTS.md § Intent Routing`=`2`, `/speckit.(brainstorm\|bump)`=`2` |
| FR-003 | `snapshot-stage.{sh,ps1}` support 9 stages (`requirements-audit\|test-design\|qa-signoff` + 6 legacy) | PASS | `bash` 9/9 exit 0 (`requirements-audit`..`bizplan`); `ps1` `requirements-audit` exit 0; smoke tags cleaned |
| FR-004 | Constitution IX `(via CI workflow)` removed | PASS | `grep -c 'via CI workflow' .specify/memory/constitution.md` = `0` |
| FR-005 | Constitution v1.9.1 adaptation note + VIII.1 `AGENTS.md` + changelog | PASS | `1.9.1`=`3`, `inactive here`=`0`, `CLAUDE.md`=`0` in constitution.md |
| FR-006 | `dispatch.md` commands & `CLAUDE.md`→`AGENTS.md` | PASS | `CLAUDE.md`=`0`; all 13 command refs exist under `.claude/commands/*.md` |
| FR-007 | Cancelled `base-green` / `/sweep-reds` & `_tasks` table removed from `CLAUDE.md`/`AGENTS.md:571` | PASS | `base-green\|sweep-reds`: `CLAUDE.md:0`, `AGENTS.md:0`; `_tasks` in `CLAUDE.md`: `0` (`AGENTS.md` Hard Rule #23 intact) |
| FR-008 | Principle `XIV. Stage Checklists` + `speckit.{plan,qa-signoff}.md` wiring + F4 `Stage map` | PASS | `### XIV.` in constitution = `1`; `XIV` in `speckit.plan.md` = `1`, `speckit.qa-signoff.md` = `1` |
| FR-009 | `knowledge/patterns/INDEX.md` bootstrap (`status: empty`) | PASS | `knowledge/patterns/INDEX.md` exists |
| FR-010 | `.claude/hooks/dialog-capture.mjs` deleted; `settings.json` untouched; ADR-008 side effect documented | PASS | `dialog-capture.mjs ABSENT`; `git diff ... -- .claude/settings.json` = `0` |
| FR-011 | Principle V dual-role paragraph | PASS | `grep -c 'dual role' .specify/memory/constitution.md` = `1` |
| FR-012 | No Principle XV added; `operational-readiness` in XIV | PASS | `grep -cE '^### (Principle )?XV\.?' .specify/memory/constitution.md` = `0`; `operational-readiness` in XIV (`:191,:194`) |
| FR-013 | `.gemini/` marked N/A in Principle I; `.gemini/` dir not generated | PASS | `.gemini ABSENT`; `N/A in UndeRoute` = `2` in constitution.md |
| NFR-001 | Token budgets (`AGENTS.md` ≤ +60, `constitution.md` ≤ +50 outside changelog) | PASS | Baseline → Final: `AGENTS.md` `712 → 721` (+9 net / +27 added); `CLAUDE.md` `55 → 32` (-23); `constitution.md` `248 → 258` (+10 total, +8 outside changelog) |
| NFR-002 | Executable AC for every FR/NFR | PASS | 18/18 executable checks above |
| NFR-003 | Zero changes under `src/`, `packages/`, `electron/`, `docker/`, `.github/workflows/` (`T019`) | PASS | `git diff --name-only bb2fbb1bae1f10947d97a9d87e7e301a2424dc43...HEAD \| grep -E "^(src/\|packages/\|electron/\|docker/\|.github/workflows/)"` → `RUNTIME_DIFF_EMPTY` |
| NFR-004 | Legacy snapshot stages backward compatible | PASS | All 6 legacy stages (`spec\|clarify\|plan\|tasks\|review\|bizplan`) exit 0 |
| NFR-005 | Single source for `Intent Routing` | PASS | `AGENTS.md` `## Intent Routing` = `1`; `CLAUDE.md` `## Intent Routing` = `0` |

## 2. Additional Verification Checks (M1 Mitigation & Doc Gates)

- **M1 (`AGENTS.md ## Intent Routing` command existence)**: **17/17 PASS** (`/blame-line`, `/deps-check`, `/diff`, `/dispatch`, `/fix-ci`, `/fix-tests`, `/fix-types`, `/improve`, `/learn`, `/perf-check`, `/questions_ideas`, `/regen`, `/resolve-conflicts`, `/speckit.brainstorm`, `/speckit.bump`, `/speckit.start`, `/verify`).
- **Transpile (`T017`)**: `node packages/cli/bin/helpers.mjs regen --targets copilot` → `EXIT=0` (318 sources → 111 generated across `copilot` target; `git diff --exit-code .github/` clean; `.gemini/` absent).
- **`check-fabricated-docs.mjs` (`F7`)**: **0 new findings** on lines added/edited by spec 006 (`AGENTS.md:714-739`). Note: 2 pre-existing upstream findings exist in `main:AGENTS.md` at lines `257` and `318` (`src/lib/localDb.ts does not exist`), causing `--strict` to report pre-existing upstream drift unrelated to spec 006.
- **Self-validation (`SC-002`)**: `speckit.analyze.md` now enforces Principle XII RTM coverage (with `qa/waiver.md` fallback to `qa/preliminary-rtm.md`) and XII.4 `- \[[xX]\] T\d+` evidence scanning (all tasks `T001`–`T019` marked `[X]` with inline evidence).
