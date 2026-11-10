# Tasks — 004-safe-harness-valves

> Формат: каждая задача ≤ 500 LOC; парная тест-задача там, где меняется поведение. **Evidence-Backed Completion (Constitution XII.4)**: `[x]` валиден только с инлайн-артефактом (path:line, тест-ID, путь к выводу команды) — заполнить при закрытии. Все задачи стартуют `[ ]`.
> Имплементация — ветка `004-safe-harness-valves` из main (Principle IX), после merge planning-PR.

## Phase 1 — Foundation (policy + audit)

- [ ] **T001 — ValvePolicy core**: `src/core/valves/policy.ts` — zod-схема ValvePolicy (deny/allow-lists, enablement, retention, timeout), загрузка/валидация/версия, fail-closed дефолты (все клапаны on; G2/G3/G4/G5 — флаг non-disableable). **Evidence**: `tests/unit/valves/policy.test.ts` зелёный (валидация, дефолты, версии).
- [ ] **T002 — Audit persistence (ADR-008)**: переписать `src/core/db/audit-logger.ts` на better-sqlite3 (WAL, prepared statements, sync insert, монотонный `seq` + индекс `(session_id, seq)`, маскирование до записи, `listBySession`); additive-миграция в `schema.ts` (`ALTER TABLE audit_events ADD COLUMN seq`, Principle X). **Evidence**: `tests/unit/db/audit-logger.test.ts` — перезапуск/цепочка, corrupt-DB отказ, маскирование (TC-009..012).
- [ ] **T003 — GateDecision + evaluateGate**: `src/core/valves/gate.ts` — детерминированные решения allow/block/needs_approval + reasonCode + policyVersion; one-shot-кеш апрувов по хешу команды. **Evidence**: `tests/unit/valves/gate.test.ts` (детерминизм NFR-002, one-shot TC-016..019).

## Phase 2 — Sandbox (G2)

- [ ] **T004 — Sandbox hardening (ADR-011)**: `container-sandbox.ts` — `--read-only`, `--tmpfs /workspace:rw`, `--tmpfs /tmp:rw`, `--security-opt seccomp=<abs>`, валидация профиля до старта (fail-closed `startup_refused`), mount-allowlist. **Evidence**: `tests/security/sandbox.test.ts` — замена таутологий: docker-gated интеграционные TC-001..004 (docker inspect + негативы); маркер `docker` в test name для skip без Docker.

## Phase 3 — Checkpoints (G4)

- [ ] **T005 — Checkpoint service (ADR-009)**: `src/core/valves/checkpoint.ts` — stash create + shadow-ref `refs/undroute/checkpoints/<sessionId>/<seq>`, restore, retention FIFO 50 + квота 500MB, non-git отказ + `--allow-no-checkpoint` (unprotected-аудит), конфликт-подтверждение. **Evidence**: `tests/unit/valves/checkpoint.test.ts` — TC-005..008 + BVA retention 49/50/51.
- [ ] **T006 — Rollback surface (Q5)**: `POST /api/sessions/[id]/rollback` + CLI `omniroute rollback --session <id> --to <id|last>`; UI-кнопка в шапке session UI. **Evidence**: API-тест в `tests/unit/api/rollback.test.ts`; скриншот/упоминание кнопки в `path:line` session UI.

## Phase 4 — Verify gates (G6)

- [ ] **T007 — Verify runner (ADR-010)**: `src/core/valves/verify-runner.ts` — вердикты GREEN/RED/TIMEOUT/SKIPPED(no_verify_config), timeout 600s/команда, персистенция VerifyRun в аудит; блок completion в state machine без GREEN/SKIPPED. **Evidence**: `tests/unit/valves/verify.test.ts` + `tests/unit/agent/state-machine-completion.test.ts` (TC-013..015, SC-004).

## Phase 5 — Destructive gate + secrets (G1, G7)

- [ ] **T008 — Pre-gate в state machine**: подключить `evaluateGate` в `requestToolExecution` (`state-machine.ts:58-73`) до проверки isDestructive; source-check в `resolveApproval` (`source: human|model`, model → reject + аудит) + one-shot семантика. **Evidence**: `tests/unit/agent/state-machine-gates.test.ts` (DT-005, ST-001, TC-016..019, негатив SC-005).
- [ ] **T009 — Deny/allow policy default set**: дефолтный deny-лист (`rm -rf` вне workspace, `git push --force`, DROP/TRUNCATE/DETACH, форматирующие, чтение `.env*`/secret-путей) + allowlist-исключения (`rm -rf node_modules` внутри workspace) + версионирование изменений. **Evidence**: таблица решений DT-005 в test-cases прогнана; unit-тесты `tests/unit/valves/policy-defaults.test.ts`.
- [ ] **T010 — Secret & prod-cred guard (G7)**: `src/core/valves/secret-guard.ts` — deny чтения `.env*`/кредов, env не пробрасываются в агентный контекст, pre-commit secret scan (блок + отчёт). **Evidence**: `tests/unit/valves/secret-guard.test.ts` (TC-020..021).

## Phase 6 — Dependency gate + override (G8, FR-008)

- [ ] **T011 — Dependency gate**: `src/core/valves/dependency-gate.ts` — детект новой зависимости в манифесте, DependencyDecision (approve/approve+pin/deny, персистится), unpinned → block, оффлайн `unverified_registry=true`. **Evidence**: `tests/unit/valves/dependency-gate.test.ts` (TC-022..023, SC-006).
- [ ] **T012 — Policy config & override (FR-008)**: конфиг-поверхность ValvePolicy, `valve_config_change` в аудит, non-disableable флаг G2/G3/G4/G5 enforced, `--override-gate`-аналог с reason в аудит. **Evidence**: `tests/unit/valves/policy-config.test.ts` (TC-024, SC-007).

## Phase 7 — Verification, bench, docs

- [ ] **T013 — Audit query endpoint (Q1)**: `GET /api/audit?sessionId=…` (read-only, существующая auth-обвязка). **Evidence**: `tests/unit/api/audit.test.ts` зелёный.
- [ ] **T014 — Perf bench**: `scripts/valves-bench.mjs` — TC-BENCH-01/02 (гейт p95<50мс/p99<100мс, чекпоинт p95<500мс @10k файлов) + TC-BENCH-03 (оверxед ≤5% по golden benign set). **Evidence**: вывод бенча сохранён в `qa/bench-results.md` (Linux-прогон).
- [ ] **T015 — Golden benign regression (SC-008)**: набор из 10 benign-задач (законные операции) — 0 ложных блокировок; upstream-сьюты зелёные (`npm test`, `npm run lint`, `npm run build`). **Evidence**: `qa/regression-results.md` + CI-лог.
- [ ] **T016 — Threat model & docs update**: `docs/threat-model.md` — актуализация sandbox-эшелона (без nsjail-фантастики), `specs/main/architecture.md` — data flow с клапанами. **Evidence**: diff обоих доков + `npm run check:doc-links` зелёный.

## Completion protocol

- Закрытие задачи = код + тесты зелёные + Evidence-строка заполнена (path:line / TC-ID / вывод).
- `/speckit.qa-signoff` (stage 8.5) — после ручного QA на живом прогоне: SKIPPED ≠ PASSED.
- Внешние ревью ×2 (Principle VI) — до `/speckit.implement` на этой ветке.
