# Implementation Plan — 004-safe-harness-valves

**Feature Branch**: `specs/004-safe-harness-valves` · **Created**: 2026-11-10 · **Status**: Draft
**Input**: [spec.md](spec.md) rev 2 (clarify Q1–Q5 resolved) · **Audit**: [requirements-audit.md](requirements-audit.md) PASS · **Ресерч**: `undreplans/docs/projects/underoute/researches/ZCode_VibeCoding-Failures-Safe-Harness-Design_20261110-2223.md`

## 1. Constitution Check (v1.9.0)

| Principle                                     | Статус для 004                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| I–III (source of truth / transformer / slots) | N/A — `.claude/` и генерируемые деревья не затрагиваются                                                                               |
| IV (SemVer 0.x)                               | N/A — релизный контур 004 не поднимает версию пакета                                                                                   |
| V (Token economy)                             | ✓ — артефакты компактны, ultrathink не расставляется                                                                                   |
| VI (Cross-AI Review)                          | план: ×2 внешних ревью обязательны до implement (гейт)                                                                                 |
| VII (Artifact Versioning)                     | ✓ — stage-теги: spec/v1, clarify/v1, requirements-audit/v1 (руководной тег: snapshot-скрипт не знает стадию — дрейф отмечен в analyze) |
| VII-B (Business plan)                         | ✓ — канон обновлён до v3.1 (коммит `9575e30` undreplans), pointer `docs/business-plan-pointer.md` на main                              |
| IX (Two-phase)                                | ✓ — планирование в `specs/004-safe-harness-valves`; имплементация — ветка `004-safe-harness-valves` из main после merge                |
| X (Expand/Contract)                           | ✓ — БД-изменений нет: таблица `audit_events` существует (`schema.ts:92-99`); только чтение/запись                                      |
| XI (Spike governance)                         | ✓ — clean-room реализация, без реюза спайк-кода                                                                                        |
| XII (QA contour)                              | ✓ — requirements-audit PASS (stage 2.5) → test-design (stage 5.5) → qa-signoff (stage 8.5) планируются                                 |
| XIII (Safety valves)                          | ✓ — фича и есть реализация XIII; negative acceptance обязательны                                                                       |

## 2. Approach

Минимально-инвазивный слой клапанов поверх существующего каркаса. Никаких новых фреймворков; только детерминированный код + конфиг. Персона-слой не трогается.

**Эшелон (порядок не менять):** policy → gates (pre) → sandbox (enforcement) → checkpoint (pre-write) → execution → verify (post) → audit (synchronous persistence на каждом шаге).

## 3. ADR

- **ADR-007 — Valve layer как отдельный модуль** `src/core/valves/` (`policy.ts`, `gate.ts`, `index.ts`). Зачем: единая точка политики (ValvePolicy, версионирование), одинаковые GateDecision для всех клапанов, тестируемость без Docker.
- **ADR-008 — Audit persistence на better-sqlite3**: переписать `AuditLogger` (`src/core/db/audit-logger.ts`) на prepared statements + WAL; монотонный `INTEGER PRIMARY KEY AUTOINCREMENT` поверх TEXT-`id` (существующий формат `audit_${Date.now()}_${random}` сохраняется как поле `ref`, чтобы не ломать схему); синхронный insert до продолжения; маскирование до записи. Rationale: better-sqlite3 уже в deps (v13.0.2), синхронная запись даёт fail-closed без асинхронных гонок.
- **ADR-009 — Checkpoints через git shadow-ref**: `git stash create` + `git update-ref refs/undroute/checkpoints/<sessionId>/<seq>`; откат = `git restore --source <ref> --worktree --staged .` + удаление untracked через сравнение; non-git → отказ старта (`--allow-no-checkpoint` — unprotected-аудит). Rationale: O(1), не трогает историю пользователя, retention через `update-ref -d`.
- **ADR-010 — Verify gates**: `src/core/valves/verify-runner.ts`; конфиг — секция `verify` ValvePolicy (дефолт-детект: `package.json#scripts` `lint/typecheck/test` либо `.undroute/verify.json`); вердикты GREEN/RED/TIMEOUT/SKIPPED; timeout 600s/команда (Q3).
- **ADR-011 — Sandbox hardening в `container-sandbox.ts`**: флаги `--read-only`, `--tmpfs /workspace:rw`, `--tmpfs /tmp:rw`, `--security-opt seccomp=<abs-path sandbox/seccomp.json>`, mount-allowlist (только workspace); профиль валидируется при старте (parse + наличие) → fail-closed `startup_refused`. Прочие флаги уже есть (512m/1cpu/pids 64/cap-drop/net none).
- **ADR-012 — Approval source enforcement + one-shot**: `resolveApproval` принимает `source: "human" | "model"`; source=model → reject + аудит; one-shot-кеш по хешу команды (единственное использование). Новое состояние не вводится — переиспользуется `AWAITING_TOOL_APPROVAL` (`state-machine.ts:65-70`), семантика алиаса `AWAITING_DESTRUCTIVE_APPROVAL` (drift note в spec).
- **ADR-013 — Audit query surface**: read-only `GET /api/audit?sessionId=…` в существующем Next.js-контуре (локальная auth-обвязка приложения); MCP/CLI-поверхности — G11.

## 4. Integration points (verified)

- `src/core/agent/state-machine.ts:58-73` — `requestToolExecution`: сюда втыкается pre-gate (G1/G7/G8) до проверки `isDestructive`; `:75-94` — `resolveApproval`: source-check + one-shot; `:96-114` — `executePendingTool`: checkpoint перед write-инструментами + verify-гейт на completion.
- `src/core/agent/container-sandbox.ts:28-38` — сборка docker-команды (ADR-011).
- `src/core/db/audit-logger.ts` — переписывается целиком (ADR-008); контракт `logEvent/getSessionLogs` сохраняется + добавляется `listBySession(sessionId, afterId)`.
- `src/core/db/schema.ts:49-100` — миграция дополняется `ALTER TABLE audit_events ADD COLUMN seq INTEGER` (additive, Principle X) — новая колонка, индекс `(session_id, seq)`.
- `src/core/agent/tool-executor.ts`, `src/core/agent/acp-bridge.ts` — точка подключения verify/checkpoint на реальном исполнении; читаются на этапе T010 (в план включены как контракт, не как дамп).
- `src/app/api/` — `audit/route.ts`, `sessions/[id]/rollback/route.ts` (Q1/Q5).

## 5. Project structure (new files)

```
src/core/valves/policy.ts          # ValvePolicy: zod-схема, load/validate/version, defaults (fail-closed)
src/core/valves/gate.ts            # evaluateGate(action, policy, ctx) -> GateDecision; deny/allow-lists; one-shot cache
src/core/valves/checkpoint.ts      # ADR-009
src/core/valves/verify-runner.ts   # ADR-010
src/core/valves/secret-guard.ts    # FR-006: deny .env/cred-paths + маскирование
src/core/valves/dependency-gate.ts # FR-007
src/core/db/audit-logger.ts        # rewrite (ADR-008)
src/app/api/audit/route.ts
src/app/api/sessions/[id]/rollback/route.ts
tests/unit/valves/*.test.ts        # policy/gate/checkpoint/verify/secret/dependency
tests/security/sandbox.test.ts     # замена таутологий (docker-gated integration)
scripts/valves-bench.mjs           # NFR-001/005 bench
```

## 6. Risks & mitigations

| Risk                                                | Mitigation                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Ложные блокировки benign-операций (kill criteria c) | golden benign set в regression-suite; allowlist-исключения; kill criteria спеки                               |
| Docker недоступен в CI/у пользователя               | integration-тесты docker-gated (skip с меткой); fail-closed старт на хосте без Docker — по спеке (Edge Cases) |
| Windows-паритет                                     | NFR-001: Windows ×2 бюджет, не блокирует; Docker обязателен и там                                             |
| Perf-деградация аудита                              | prepared statements, WAL, индекс (session_id, seq); bench в CI-джобе                                          |
| Scope creep в G9+                                   | жёсткий Out of scope спеки; G9 — следующая спека, блокирует MVP-2                                             |

## 7. Testing strategy

- **Unit** (node:test, `npm test`): policy-валидация, gate-детерминизм (NFR-002), state machine + approval source + one-shot, secret-маскирование, dependency pin, retention BVA.
- **Integration (docker-gated, `tests/security/`)**: SC-001 через `docker inspect` + негативные прогоны (запись вне writedirs, mount /etc, битый seccomp → startup_refused).
- **Perf**: `scripts/valves-bench.mjs` — TC-BENCH-01/02/03 (NFR-001/005); CI-job Linux блокирует, Windows — фиксируется.
- **Exploratory**: EC-005 charter — «выбраться из песочницы/гейтов» (Risk=20, Constitution XIII.3).
- **Regression**: golden benign set + upstream-сьюты зелёные (`qa/regression-suite.md`).

## 8. Follow-ups (вне 004)

G9 quarantine (блокирует MVP-2) → spec 005; G10–G12 → 006+; обновление `docs/threat-model.md` — задача T016 в tasks.md.
