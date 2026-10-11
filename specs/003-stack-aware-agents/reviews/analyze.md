# SpecKit Analyze: 003-stack-aware-agents

**Reviewer**: analyze (Claude self-consistency)
**Reviewed at**: 2026-10-11T06:08:46Z
**Commit**: 403ebefaabdc6a0c5e7966018d78f0c056212d18 (UndeRoute `main`; the feature directory is untracked, so this SHA does not contain the reviewed artifacts)
**Artifacts**: spec.md, plan.md, tasks.md, data-model.md, contracts/cli-interface.md, research.md, quickstart.md, checklists/requirements.md, business-plan-waiver.md; constitution `UndeRoute/.specify/memory/constitution.md` v1.7.0

`.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` aborted: the current branch is `main`, so the script looked for `specs/main`. The artifacts were loaded from `specs/003-stack-aware-agents/` directly. The abort is a symptom of D1 and D2.

This run replaces the PASS from 2026-10-11T03:30:00Z, which was computed against the superseded constitution v1.5.0 and spec rev 1. Rev 2 closes review findings F1–F25 from `reviews/copilot.md` in the artifacts, except the repository state behind F1 (D1, D2). Rev 2 also retargets the code from the stale `repos/under-ai-helpers` snapshot (0.6.0) to UndeRoute's own tracked `packages/cli/` (`underoute-clai` 1.0.0), see spec Q7.

## Findings

| ID  | Category           | Severity | Location(s)                                  | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recommendation                                                                                                                                                                                                                                                                                               |
| --- | ------------------ | -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Constitution (VII) | CRITICAL | plan.md:L47-L57, plan.md:L73, tasks.md:L21   | Artifacts are not committed (`?? specs/003-stack-aware-agents/`), and UndeRoute has no `spec`, `plan` or `tasks` tags for `003-stack-aware-agents`. The only tag, `review/003-stack-aware-agents/v1`, sits in the parent repo `UnderUndre` (5f75d99), which does not contain the spec.                                                                                                                                                                                                                                  | Run T001 (commands at plan.md:L49-L57), then re-run `/speckit.analyze`. Remove the parent-repo tag only with explicit consent.                                                                                                                                                                               |
| D2  | Constitution (IX)  | CRITICAL | spec.md:L8, plan.md:L76, tasks.md:L21        | The planning branch `specs/003-stack-aware-agents` does not exist; the artifacts sit in the `main` working tree. plan.md marks IX as "PASS при выполнении T001 и T002", which is a future condition, not the current state.                                                                                                                                                                                                                                                                                             | Same remediation as D1: `git switch -c specs/003-stack-aware-agents` before the commit.                                                                                                                                                                                                                      |
| D3  | Constitution (III) | MEDIUM   | plan.md:L69, spec.md:L171-L173               | Principle III requires project-specific overrides in managed files to use `HELPERS:CUSTOM` markers. The stack binding keeps a per-repo `skills:` line outside markers. plan.md passes III by treating the line as pipeline output ("вычисляемое поле привязки"). This analysis agrees: the line is computed from `.claude/stack-matrix.json`, and hand edits are still caught and overwritten. But the constitution does not name this mechanism, so an external reviewer can block on it.                              | Add a one-line clarification to Principle III in a separate constitution PATCH (CLI-computed, lock-recorded fields are pipeline output, not overrides), or have both external reviewers confirm this reading explicitly.                                                                                     |
| U1  | Underspecification | MEDIUM   | spec.md:L160, spec.md:L172, spec.md:L99-L115 | Bare sync applies the stored `add` and `remove` to a changed upstream base. (a) If upstream adds a gated name the repo does not use (for example `prisma-expert` to `database-architect` in a repo without Prisma), bare sync keeps it, and `status --strict` fails with `orphaned_stack` until `--update-stack`. No edge case or test states this. (b) If upstream adds a name that is already in the stored `add` (for example `nestjs-expert`), FR-003 step 7 (`base` without `remove`, then `add`) writes it twice. | In FR-005, apply `add` minus `base` and drop such names from the stored binding. Add an edge case for "upstream changed the `skills:` line of a bound agent": either document the failing CI as intended, or store the fired set so bare sync can re-gate new base names. Cover both cases in T014 and T022. |
| B1  | Ambiguity          | LOW      | spec.md:L211                                 | NFR-005 says `sync` and `diff` output for unbound consumers matches 1.0.0, but the same release ships a template with `.claude/stack-matrix.json` and `STACK_RULES` slots, so `sync` output changes. SC-005 already limits the golden test to `status` and `doctor`.                                                                                                                                                                                                                                                    | Add "на тех же входах (тот же шаблон)", or limit NFR-005 to the commands SC-005 checks.                                                                                                                                                                                                                      |
| B2  | Ambiguity          | LOW      | research.md:L110                             | The probe result is a deliberate placeholder ("заполняет T003"), and FR-004's output format depends on it.                                                                                                                                                                                                                                                                                                                                                                                                              | Fill it in T003. The graph already blocks T015 on T003.                                                                                                                                                                                                                                                      |
| F1  | Inconsistency      | LOW      | spec.md:L252, tasks.md:L59                   | SC-001's secondary check ("Awk хука печатает тот же список") fails on CRLF agent files: the hook matches `^---$`, which does not match `---\r`, while FR-004 preserves CRLF. This hook limitation predates the feature.                                                                                                                                                                                                                                                                                                 | Run the secondary check on an LF fixture and note the limitation, or fix the hook upstream separately.                                                                                                                                                                                                       |
| C1  | Underspecification | LOW      | tasks.md:L57                                 | T020 bundles the sync overlay, plan-phase validation, hash/drift normalization, `--dry-run`, the kill switch and missing-matrix handling. It will likely exceed the 500 LOC WRAP limit stated at the end of tasks.md.                                                                                                                                                                                                                                                                                                   | Split T020 into 2–3 tasks in the next tasks revision: overlay in sync; normalization in hash and drift; dry-run and kill switch.                                                                                                                                                                             |

## Coverage Summary

| Requirement Key                   | Has Task? | Task IDs                           | Notes                                                        |
| --------------------------------- | --------- | ---------------------------------- | ------------------------------------------------------------ |
| FR-001 manifest-discovery-parsing | Yes       | T012, T013, T016, T017, T034       | `git ls-files`, PEP 621/735 via `confbox`, no code execution |
| FR-002 stack-matrix-override      | Yes       | T007, T008, T009                   | Template matrix v1, `helpers-stack.json`                     |
| FR-003 skill-line-computation     | Yes       | T014, T018                         | Base, gating, budget; see U1                                 |
| FR-004 frontmatter-writer         | Yes       | T003, T015, T019                   | Output format from probe T003                                |
| FR-005 binding-lifecycle          | Yes       | T020, T021, T022                   | Rollback verified in T022; see U1                            |
| FR-006 stack-drift-linter         | Yes       | T023, T024, T025                   |                                                              |
| FR-007 named-slots                | Yes       | T009, T010, T011, T028, T029, T030 | One marker grammar for `slots.ts` and `hash.ts`              |
| FR-008 ci-integration             | Yes       | T026, T027                         | `status --json` unchanged                                    |
| FR-009 upstream-matrix-validation | Yes       | T031, T032, T038                   |                                                              |
| NFR-001 performance               | Yes       | T033, T038                         | p95 and p99; `ubuntu-latest` blocks the release              |
| NFR-002 determinism               | Yes       | T012, T022, T023                   |                                                              |
| NFR-003 preload-budget            | Yes       | T014, T018                         |                                                              |
| NFR-004 offline                   | Yes       | T027                               | Network stubbed to throw                                     |
| NFR-005 compatibility-opt-in      | Yes       | T026, T027, T036                   | See B1                                                       |
| SC-001                            | Yes       | T003, T022                         | See F1                                                       |
| SC-002                            | Yes       | T033                               |                                                              |
| SC-003                            | Yes       | T022                               |                                                              |
| SC-004                            | Yes       | T028, T030                         |                                                              |
| SC-005                            | Yes       | T027                               | Golden files from 1.0.0                                      |

## Constitution Alignment Issues

- **VII Artifact Versioning**: D1 (CRITICAL).
- **IX Two-Phase Review Flow**: D2 (CRITICAL).
- **III Protected Slots**: D3 (MEDIUM; interpretation risk, not a violation in this analysis).
- **VI Cross-AI Review Gate**: open. This is the gate state, not an artifact defect. The gate needs this analyze at PASS or OVERRIDDEN plus two external PASS verdicts on rev 2. `reviews/copilot.md` is CRITICAL on rev 1. `reviews/zcode.md` predates Q5, and `zcode` is not one of the provider tags VI lists (`claude`, `codex`, `antigravity`, `gemini`, `copilot`), so it does not count.
- **IV SemVer**: the plan targets a MINOR via `/bump` (expected 1.1.0). IV is written for 0.x, while `packages/cli/package.json` is already 1.0.0 (set by hand in `3006eac34`) and the CHANGELOG ends at 0.1.0. This predates the feature; T036 asks the maintainer to confirm the baseline.
- **VII-B Business Plan**: waiver present (VII-B.5).
- **X Zero-Downtime Data**: N/A. No database; the lock change only adds an optional field.
- **XI Spike Governance**: one spike (T003) with a timebox, a numeric metric and disposal. The old perf numbers are marked as an estimate; T033 validates NFR-001.
- **VIII (pre-existing, out of scope)**: UndeRoute's `helpers.config.ts` ships `.claude/**/*` without excluding `.claude/hooks/`, while VIII keeps hooks upstream-only. The feature does not depend on hooks.
- **VII note**: VS Code Local History copies exist under `repos/.history/UndeRoute/specs/003-stack-aware-agents/`. They are outside the UndeRoute repo, and the parent repo ignores `repos/`, so this is not a violation. Do not commit them.

Other passes:

- **I Supply chain**: one new direct dependency, `confbox` `^0.1.8` (MIT), already installed through `c12@2.0.4`. T004 commits the lockfiles; T038 runs `npm ci` and `npm audit`. No GPL or AGPL.
- **J Expand/Contract**: N/A.
- **L Trust boundaries**: no PII, tokens or payments; `.env` is not read; STRIDE is covered in spec.md and plan.md.
- **M Operations**: local CLI without network access (NFR-004), so OpenTelemetry does not apply. Logging uses `consola` prefixes and a JSON report; recovery uses the journal and `helpers recover --rollback`, verified in T022. Not flagged.
- **G Agent routing**: every task has a tag. The graph uses `→`, `+` and template-style fan-out commas, with no chained arrows. All 38 IDs exist, and the graph is acyclic because every edge points to a higher ID. Lanes and the Agent Summary match the tags (6/23/4/1/1/2/1). `[SEC]` T034 and `[E2E]` T022, T027, T030, T037 depend on implementation tasks. The shared fixture directory has the common `[SETUP]` dependency T005. No file is written by two agents.

## Commercial / Business Plan Alignment

- Plan files loaded: none under `UndeRoute/docs/**/*business-plan*.md`. The product plan lives outside the repo (`undreplans/docs/projects/underoute/business-plan.md`, v3.0) and is referenced by the waiver.
- Focus/hard laws checked: the waiver states that no VII-B.2 trigger applies. A grep of the external plan finds no mention of the CLI or the template in its SKUs or Hard Law.
- Findings: none. Pass H skipped because `business-plan-waiver.md` exists.

## Unmapped Tasks

None. T001 and T002 map to Principles VII and IX; T004 and T005 set up FR-001 and the test layout; T034 maps to FR-001 and STRIDE; T035 documents NFR-005.

## Metrics

- Total Requirements: 14 (FR-001..FR-009, NFR-001..NFR-005), plus 5 success criteria
- Total Tasks: 38
- Coverage % (requirements with ≥1 task): 100% (14/14; SC 5/5)
- Ambiguity count: 2 (B1, B2)
- Duplication count: 0
- CRITICAL count: 2
- HIGH count: 0
- MEDIUM count: 2
- LOW count: 4

## VERDICT

```yaml
verdict: CRITICAL
reviewer: analyze
reviewed_at: 2026-10-11T06:08:46Z
commit: 403ebefaabdc6a0c5e7966018d78f0c056212d18
critical_count: 2
high_count: 0
medium_count: 2
low_count: 4
note: Both CRITICAL findings are repository state (Principles VII and IX) and close with T001. Artifact content has no CRITICAL or HIGH findings.
```
