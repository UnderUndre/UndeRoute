---
description: "Task list for Stack-Aware Agent Fleet Synchronization with agent routing and dependency graph"
---

# Tasks: Stack-Aware Agent Fleet Synchronization

> "Never half-ass two things. Whole-ass one thing." («Никогда не делай два дела вполсилы. Делай одно дело на всю катушку.») — Рон Свонсон (_Parks and Recreation_)
> "Чё там с сосисками, Чарли? — Пять минут, Турецкий. — Пять минут назад ты сказал, что будет готово через две минуты!" — _Большой куш / Snatch_ (о дейликах и эстимейтах)
> "Первые 90% проекта занимают 90% времени. Оставшиеся 10% — другие 90%." — The 90-90 rule

**Input**: Design documents from `/specs/003-stack-aware-agents/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`)
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/ (rev 2, 2026-10-11)
**Target**: UndeRoute — `packages/cli/` (`underoute-clai` 1.0.0), шаблон `.claude/` и `.github/workflows/`. Пути ниже даны от корня UndeRoute. Устаревший снапшот `repos/under-ai-helpers` (0.6.0) не редактируется.

---

## Phase 1: Gates & Setup

**Purpose**: Закрыть Principle VII и IX, выбрать формат строки `skills:`, подготовить пакет

- [x] T001 [SETUP] Planning branch and versioning in UndeRoute — executed by the user (Standing Order 1: no commits without an explicit request). Run the commands from plan.md «Repository Topology & Branch Flow»: `git switch -c specs/003-stack-aware-agents`, commit `specs/003-stack-aware-agents/`, `snapshot-stage` for `spec`, `plan`, `tasks`. Treat `review/003-stack-aware-agents/v1` in the parent `UnderUndre` repo as invalid; delete it only with explicit consent. Blocks `/speckit.implement` (Principle VII).
- [x] T002 [SETUP] After the planning PR merges: in UndeRoute create branch `003-stack-aware-agents` from `main` (Principle IX). The implementation PR links the planning PR.
- [x] T003 [SETUP] Spike (Principle XI, timebox 0.5 day): Claude Code `skills` format probe. In a scratch consumer, create two tiny skills (`probe-a`, `probe-b`) and two agents with `skills: probe-a, probe-b` and `skills: [probe-a, probe-b]`; spawn each with `claude --debug`; metric = preloaded skills per agent (expected 2 of 2). Record the Claude Code version, the counts and the chosen `SKILLS_LINE_FORMAT` in research.md §6, then delete the scratch repo. No spike code or tests enter the package.
- [x] T004 [SETUP] Add `confbox` `^0.1.8` to `packages/cli/package.json` dependencies after maintainer approval (Standing Order 2) and commit the updated lockfiles (`package-lock.json`; `pnpm-lock.yaml` if it is tracked). `npm ls confbox` must show a single version; license MIT. No other new dependencies.
- [x] T005 [SETUP] Create `packages/cli/src/core/stack/`, `packages/cli/tests/unit/stack/`, `packages/cli/tests/integration/stack/`, `packages/cli/tests/bench/` and consumer fixtures in `packages/cli/tests/fixtures/stack/` (git repo with `helpers-lock.json`, template with the v1 matrix and the current upstream agent lines).

---

## Phase 2: Foundational

**Purpose**: Типы, матрица, override, грамматика слотов и шаблон — блокируют все истории

- [x] T006 [BE] Define the types from data-model.md in `packages/cli/src/core/stack/types.ts`. Add `stack?: StackBinding` to `SourceEntry` in `packages/cli/src/types/lock.ts`; lock schema stays 1.
- [x] T007 [BE] Tests `packages/cli/tests/unit/stack/matrix.test.ts` (RED first): matrix and override schema — unknown keys rejected, id/name/`mutexGroup` regex, roles enum, unique ids, `packages` or `files` required, `agents` map, budget bounds; override merge — `enabled`, `disableRules`, replace or add by `id`, `pin`, `budget`, `scan.exclude`.
- [x] T008 [BE] Implement `packages/cli/src/core/stack/matrix.ts` (load and validate `.claude/stack-matrix.json`) and `override.ts` (`helpers-stack.json`). JSON only: no c12, no jiti, no `helpers.config.ts`.
- [x] T009 [SETUP] Template: add `.claude/stack-matrix.json` with the v1 table from spec FR-002; confirm the `claude` target in the upstream `helpers.config.ts` ships it; add an empty `<!-- HELPERS:CUSTOM START: STACK_RULES -->` / `<!-- HELPERS:CUSTOM END: STACK_RULES -->` block to the bodies of `frontend-specialist`, `backend-specialist`, `database-architect` and `test-engineer`.
- [x] T010 [BE] Tests `packages/cli/tests/unit/slot-markers.test.ts` (RED first): named and unnamed markers in md, yaml and js styles; END name must match START; duplicate name, unclosed START, stray END and nesting are errors; named slots merge by name, unnamed by ordinal; editing a named slot body leaves the canonical hash unchanged; a 1.0.0 fixture with unnamed slots keeps its old hash.
- [x] T011 [BE] Implement `packages/cli/src/core/slot-markers.ts` and switch `core/slots.ts` (parse, merge, validate) and `core/hash.ts` (slot placeholder) to it. Delete the duplicated marker regexes in `hash.ts`.

---

## Phase 3: User Story 1 - Stack Sniffer & Skill Gating (Priority: P1) 🎯 MVP

**Goal**: Обнаружить стек, посчитать дельту к апстримной строке и сохранить её как привязку, которую переживает любой sync

### Tests for User Story 1 (RED first)

- [x] T012 [BE] [US1] Tests `packages/cli/tests/unit/stack/discover.test.ts`: git mode lists tracked files only (an untracked `.claude/worktrees/x/package.json` is invisible); walker fallback outside git with warn `not_git_repo`; depth formula (root file = 0, ≤ 4); every denylist segment and everything under `.claude/`; `scan.exclude`; symlink whose realpath leaves `rootDir` → `symlink_escape`; file > 2 MiB → `oversize`; > 1000 manifests → `manifest_cap`; sorted, deterministic output.
- [x] T013 [BE] [US1] Tests `packages/cli/tests/unit/stack/manifests.test.ts`: npm `dependencies` and `devDependencies` only, BOM tolerated, malformed JSON → `malformed_manifest`; PyPI sources from FR-001 (`project.dependencies` as an array in `[project]`, `project.optional-dependencies`, `dependency-groups` with `include-group` skipped, Poetry main and groups without `python`, `requirements*.txt` and `requirements/*.txt` without options and comments, `Pipfile`); PEP 503 normalization; extras and markers stripped; lockfiles never read; marker globs against the discovered list; major extraction table, unknown forms never conflict.
- [x] T014 [BE] [US1] Tests `packages/cli/tests/unit/stack/plan.test.ts`: the US1 scenarios against the current upstream lines; base dedup; gating, `add` and `remove`; order (base order, then `add` by rule id in code units, then skill order inside the rule); `mutexGroup` ambiguity and `pin`; `disableRules` makes names non-gated; missing catalog → skipped plus `missing_skill_catalog`; budget by count and bytes truncates `add` only; empty base; re-applying a stored delta to a changed base never duplicates a name and prunes `add` names now in base.
- [x] T015 [BE] [US1] Tests `packages/cli/tests/unit/stack/frontmatter.test.ts`: only the `skills:` line of the first block changes; insert before the closing `---` when absent and the list is non-empty; `---` not on line 1, block list, duplicate key or invalid name → `malformed_frontmatter`; CSV and flow forms are read; output follows `SKILLS_LINE_FORMAT`; CRLF, LF and BOM preserved; all other bytes unchanged; post-render YAML parse equals the expected list.

### Implementation for User Story 1

- [x] T016 [BE] [US1] Implement `packages/cli/src/core/stack/discover.ts` per FR-001 (`git ls-files -z`, walker fallback, depth, denylist, realpath, size and count caps).
- [x] T017 [BE] [US1] Implement `packages/cli/src/core/stack/manifests.ts` per FR-001 (npm, PyPI via `confbox`, PEP 503, major extraction). No lockfile parsing, no code execution.
- [x] T018 [BE] [US1] Implement `planAgentSkills` in `packages/cli/src/core/stack/plan.ts` per FR-003.
- [x] T019 [BE] [US1] Implement `packages/cli/src/core/stack/frontmatter.ts` per FR-004 with the `SKILLS_LINE_FORMAT` chosen in T003.
- [x] T020 [BE] [US1] Binding lifecycle per FR-005 in `packages/cli/src/cli/sync.ts` and `packages/cli/src/core/stack/binding.ts`: `--update-stack` on the `sync` command's `defineCommand` (not on `src/cli.ts`); plan-phase frontmatter validation before the first write; bare sync re-applies the stored `add`/`remove` after `mergeSlots` and refreshes `stack.base`; `--update-stack` recomputes the delta and creates or refreshes the binding; catalog = state after the plan; all-malformed manifests leave the binding untouched; `ejected`/`orphaned` skipped.
- [x] T039 [BE] [US1] Skills-line normalization for bound entries in `packages/cli/src/core/hash.ts` and `packages/cli/src/core/drift.ts` (FR-005): placeholder `<<HELPERS:STACK>>` in both canonical hashes; unbound entries hash as in 1.0.0.
- [x] T040 [BE] [US1] `packages/cli/src/cli/sync.ts`: `--dry-run` prints old and new lines and writes nothing; `enabled: false` → no re-apply and `--update-stack` exit 1; missing matrix → `--update-stack` exit 1.
- [x] T021 [BE] [US1] `packages/cli/src/cli/diff.ts`: apply the binding to the rendered agent before diffing.
- [x] T022 [E2E] [US1] Integration `packages/cli/tests/integration/stack/lifecycle.test.ts` on the consumer fixture: US1 scenarios 1–3; YAML-parsed `skills` equals the expected list; the hook awk prints the same list (LF fixture); an upstream change that adds a gated name gives `orphaned_stack` after bare sync and none after `--update-stack`, and an upstream name already in `add` is written once; bare `sync` keeps the line byte-for-byte and `status --strict` exits 0; an upstream body change updates the body and keeps the line; a second `--update-stack` is a no-op; `--dry-run` writes nothing; `helpers diff` shows no diff for bound agents; a `--update-stack` run interrupted after the first agent write (fault injection) is undone by `helpers recover --rollback`: agent files byte-for-byte as before, lock unchanged.

---

## Phase 4: User Story 2 - Stack Drift Detection & CI Gate (Priority: P2)

**Goal**: Ловить расхождение строки с текущим стеком локально и в CI, не меняя поведения у тех, кто фичу не включал

### Tests for User Story 2 (RED first)

- [x] T023 [BE] [US2] Tests `packages/cli/tests/unit/stack/drift.test.ts`: HIGH — `unmapped_stack`, `orphaned_stack`, `missing_base`, `unexpected_skill`, `malformed_frontmatter`, `unbalanced_slot`; MEDIUM — `ambiguous_stack`, `version_conflict`, `missing_skill_catalog`, `skill_budget`, `order_only`, `agent_missing`, `matrix_missing`; LOW — `preview` for unbound agents; a missing matrix falls back to the stored delta; report JSON deterministic (sorted, no absolute paths, no time).

### Implementation for User Story 2

- [x] T024 [BE] [US2] Implement `evaluateStack` in `packages/cli/src/core/stack/drift.ts` per FR-006: expected line from current inputs and `stack.base`, compared with the `skills:` line of the first frontmatter block.
- [x] T025 [BE] [US2] `packages/cli/src/cli/doctor.ts`, `doctor/checks/stack.ts`, `doctor/types.ts`: `--stack` runs only the stack check; `DoctorResult.exitCode` becomes `0 | 1 | 2`; human prefixes from contracts; `--json` prints `StackDriftReport`; `--verbose` lists detected packages.
- [x] T026 [BE] [US2] `packages/cli/src/cli/status.ts`: under `--strict`, call `evaluateStack` only when the lock has at least one binding and the override does not disable the feature; exit 2 on file drift or stack HIGH; human `[stack]` block; `--json` output unchanged. `cli/doctor/checks/drift.ts`: add the hint `Run 'helpers doctor --stack' for details`.
- [x] T027 [E2E] [US2] Integration `packages/cli/tests/integration/stack/status.test.ts`: US2 scenarios 1–3; bound HIGH → `status --strict` exit 2 while `status --json` stays the 1.0.0 array; MEDIUM only → 0; malformed manifest → warn and 0; invalid `helpers-stack.json` → exit 1; `status --strict` and `doctor --stack` give the same results with network access stubbed to throw (NFR-004); golden files from 1.0.0 for `status`, `status --strict`, `status --json` and `doctor` on an unbound fixture (SC-005).

---

## Phase 5: User Story 3 - Local Rules via Named Slot `STACK_RULES` (Priority: P3)

**Goal**: Локальные правила команды переживают обновления апстрима байт-в-байт

### Tests for User Story 3 (RED first)

- [x] T028 [BE] [US3] Tests `packages/cli/tests/unit/stack/slots-sync.test.ts`: the `STACK_RULES` body survives bare `sync` and `--update-stack` byte-for-byte; editing the body causes no drift; a non-empty local named slot missing from the upstream render → exit 1 with no writes; an unbalanced marker in any planned file → exit 1 with no writes for the whole run.

### Implementation for User Story 3

- [x] T029 [BE] [US3] `packages/cli/src/cli/sync.ts`: run `validateSlotPairing` (named grammar) for every planned file before the first write; refuse to drop a non-empty named slot. `doctor/checks/stack.ts`: report `unbalanced_slot` (HIGH) for the four stack agents.
- [x] T030 [E2E] [US3] Integration `packages/cli/tests/integration/stack/slots.test.ts`: template with the `STACK_RULES` slot, the consumer fills it, upstream changes the agent body; `sync` and `sync --update-stack` keep the body; `status --strict` exits 0 (US3 scenarios 1–3).

---

## Phase 6: Upstream Validation, Polish & Release Readiness

**Purpose**: Валидация матрицы в апстриме, бюджет NFR-001, безопасность, документация и финальные гейты

- [x] T031 [BE] Tests `packages/cli/tests/unit/stack/validate-matrix.test.ts` (RED first) for `validateStackMatrix`: schema, unique ids, valid names, every skill has `.claude/skills/<name>/SKILL.md`, every role's agent has `.claude/agents/<agent>.md`.
- [x] T032 [BE] Implement `validateStackMatrix` in `packages/cli/src/core/stack/matrix.ts` and call it from `packages/cli/src/cli/regen.ts` in upstream mode when `.claude/stack-matrix.json` exists (exit 1 on failure). Run it against the template from T009.
- [x] T033 [PERF] Bench `packages/cli/tests/bench/stack-scan.bench.ts`: generated fixture with 10 000 tracked files and 50 manifests (depth ≤ 4); 3 warm-up runs and 30 measured runs of discovery + parse + plan; report p95 and p99; assert p95 < 150 ms and p99 < 300 ms on `ubuntu-latest`; record the Windows result with a ×2 budget, non-blocking. Also measure `helpers doctor --stack` wall-clock ≤ 1 s (SC-002).
- [x] T034 [SEC] Review the diff: no `eval`, `import()` or `require()` of repo files; `helpers.config.ts` is not loaded by stack, `status` or `doctor` code; the name regex is enforced for the matrix, the override and the existing line; the post-render YAML check is present; symlink, size and cap tests are present (T012).
- [x] T035 [DOC] Document `helpers sync --update-stack`, `helpers doctor --stack`, `helpers-stack.json`, the opt-in semantics and the binding in `packages/cli/README.md` and `README.ru.md`. Say the bin name is `helpers`; state that Gemini and Copilot do not receive `skills`.
- [x] T036 [DOC] `packages/cli/CHANGELOG.md` entry and migration note: opt-in binding, unchanged `status --json`, named slot grammar, `STACK_RULES` slot in the template, `confbox` dependency, CLI ≤ 1.0.x drops bindings on sync. The changelog currently ends at 0.1.0 while `package.json` says 1.0.0: confirm the release baseline with the maintainer. Do not bump the version here; `/bump` (expected 1.1.0) is a separate release step (Principle IV).
- [x] T037 [E2E] Run the quickstart tracer on a consumer fixture outside UndeRoute (UndeRoute itself runs in upstream mode) with the CLI built from the implementation branch (`node <UndeRoute>/packages/cli/bin/helpers.mjs`) and `helpers init --ref 003-stack-aware-agents`. Expect the prefixes and lines from `quickstart.md`.
- [x] T038 [OPS] Add `.github/workflows/helpers-cli.yml` (no workflow builds `packages/cli/` today), triggered by changes under `packages/cli/`, `.claude/` and `helpers.config.ts`. Job `test`: in `packages/cli/` run `npm ci` against the committed `package-lock.json`, then `npm run validate`, `npm test`, `npm run build` and `npm audit` (zero High/Critical); run `helpers regen` with matrix validation. Job `stack-bench`: T033 on `ubuntu-latest` (release-blocking) and `windows-latest` (report only).
- [x] T041 [CONFIG] Include `.specify/**/*` in the `claude` target pipeline in `helpers.config.ts` (FR-010) ensuring automatic SpecKit templates delivery alongside Claude agents.

---

## Dependency Graph

```text
T001 → T002, T003
T002 → T004, T005, T009
T005 → T006
T006 → T007, T010, T012
T007 → T008
T010 → T011
T012 → T016
T004 + T006 → T013
T013 → T017
T008 → T014, T031
T014 → T018
T003 + T004 + T006 → T015
T015 → T019
T011 + T016 + T017 + T018 + T019 → T020
T020 → T021
T011 → T039
T020 → T040
T009 + T021 + T039 + T040 → T022
T018 → T023
T023 → T024
T024 → T025
T020 + T024 + T039 → T026
T025 + T026 → T027
T011 + T020 → T028
T028 → T029
T009 + T029 → T030
T009 + T031 → T032
T016 + T017 → T033
T020 + T024 + T029 → T034
T022 + T027 + T030 + T032 + T033 + T034 → T035
T022 + T027 + T030 + T032 + T033 + T034 → T036
T022 + T027 + T030 + T032 + T033 + T034 → T037
T035 + T036 + T037 → T038
```

---

## Parallel Lanes

| Lane                               | Primary Agent     | Tasks                                                                                          | Description                                                                      |
| :--------------------------------- | :---------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Lane 0 (Gates & Template)**      | `[SETUP]`         | T001, T002, T003, T004, T005, T009                                                             | Ветка планирования, ветка реализации, проба формата, зависимость, каркас, шаблон |
| **Lane 1 (Core)**                  | `[BE]`            | T006, T008, T011, T016, T017, T018, T019, T020, T021, T024, T025, T026, T029, T032, T039, T040 | Типы, матрица, слоты, обнаружение, парсинг, расчёт, writer, привязка, drift, CLI |
| **Lane 2 (Unit tests, RED first)** | `[BE]`            | T007, T010, T012, T013, T014, T015, T023, T028, T031                                           | Юнит-тесты до реализации                                                         |
| **Lane 3 (Integration)**           | `[E2E]`           | T022, T027, T030, T037                                                                         | Жизненный цикл, CI-гейт, слоты, трассер                                          |
| **Lane 4 (Perf & Security)**       | `[PERF]`, `[SEC]` | T033, T034                                                                                     | Бенч NFR-001, ревью диффа                                                        |
| **Lane 5 (Docs & Ops)**            | `[DOC]`, `[OPS]`  | T035, T036, T038                                                                               | README, CHANGELOG, CI-job и финальные гейты                                      |

---

## Agent Summary

| Agent     | Task Count | Start Condition                                                  | Focus                                                 |
| :-------- | :--------- | :--------------------------------------------------------------- | :---------------------------------------------------- |
| `[SETUP]` | 6          | T001 — сразу (выполняет пользователь); остальные после T001/T002 | Гейты VII и IX, проба T003, `confbox`, каркас, шаблон |
| `[BE]`    | 25         | После T005/T006                                                  | 9 тест-задач до реализации и 16 задач кода            |
| `[E2E]`   | 4          | После реализации своей истории                                   | Интеграция и трассер                                  |
| `[PERF]`  | 1          | После T016 и T017                                                | p95/p99 и SC-002                                      |
| `[SEC]`   | 1          | После T020, T024 и T029                                          | Нет исполнения чужого кода и инъекций во frontmatter  |
| `[DOC]`   | 2          | В конце                                                          | README, CHANGELOG и migration note                    |
| `[OPS]`   | 1          | В конце                                                          | CI-job бенча, validate/test/build/audit, `regen`      |

---

## Critical Path

```text
T001 → T002 → T005 → T006 → T007 → T008 → T014 → T018 → T023 → T024 → T026 → T027 → T035 → T038
```

Параллельная цепочка той же длины: `… → T018 → T020 → T028 → T029 → T030 → T035 → T038`. T020 ждёт T011, T016, T017, T018 и T019, поэтому слоты (T010–T011) и проба T003 должны закончиться раньше.

Каждая задача — меньше 500 LOC (WRAP). Версию пакета в этих задачах не менять.
