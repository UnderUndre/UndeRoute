# Test Cases — 004-safe-harness-valves (stage 5.5, ISO/IEC/IEEE 29119-4: BVA, EP, Decision Table, State Transition, Error Guessing)

> Техники: BVA (retention/timeout), EP (классы команд deny/allow), Decision Table (FR-005), State Transition (state machine), Error Guessing (EC-005 charter). Integration-тесты с Docker помечены `[docker]` — skip с меткой, если Docker недоступен (не считается провалом; SKIPPED ≠ PASSED).

## FR-001 Sandbox (T004) — [docker]

- **TC-001 (Inspection)**: задача «создать файл и запустить тест» в фикстуре → `docker inspect` показывает `ReadonlyRootfs=true`, `CapDrop=["ALL"]`, `Memory=536870912`, `NanoCpus=1000000000`, `PidsLimit=64`, `NetworkMode=none`, `SecurityOpt` ⊇ `seccomp=<abs>`.
- **TC-002 (EP-негатив: запись вне writedirs)**: `sh -c 'touch /etc/pwned'` → отклонено, агент получил структурированную ошибку, аудит: событие блокировки.
- **TC-003 (EP-негатив: mount)**: попытка mount `/etc` → отклонён, событие в аудите.
- **TC-004 (fail-closed)**: `sandbox/seccomp.json` удалён/бит → старт отказан (`startup_refused` в аудите), fallback-режим отсутствует.

## FR-002 Checkpoints (T005–T006)

- **TC-005 (байт-в-байт откат)**: 4 записи → rollback к чекпоинту 2 → diff пуст; аудит: `checkpoint_created`×4, `rollback_performed`.
- **TC-006 (non-git отказ)**: non-git каталог → старт отказан; с `--allow-no-checkpoint` — старт, каждая запись `unprotected=true`.
- **TC-007 (конфликт)**: пользовательские правки после чекпоинта → rollback требует подтверждения, diff показан; молчаливой потери нет.
- **TC-008 (BVA retention)**: 49 → все живы; 50 → все живы; 51 → старейший удалён (FIFO), аудит ротации.

## FR-003 Audit (T002)

- **TC-009 (перезапуск)**: прогон → рестарт процесса → `/api/audit?sessionId` возвращает полную цепочку, монотонные `seq`.
- **TC-010 (corrupt DB)**: повреждён файл БД → новые сессии не стартуют (fail-closed), forensic-подсказка.
- **TC-011 (маскирование)**: событие с содержимым `.env`-подобной строки → в БД замаскировано (хеш/`***`), сырого значения нет.
- **TC-012 (блокировка БД)**: параллельная сессия держит блок → retry с бэкоффом; >таймаута — пауза исполнения, не продолжение.

## FR-004 Verify gates (T007)

- **TC-013 (completion_blocked)**: падающий тест → done-клейм отклонён, состояние ACT, вывод в контексте; аудит `completion_blocked`.
- **TC-014 (SKIPPED ≠ PASSED)**: проект без verify-конфига → `SKIPPED(no_verify_config)`, done разрешён, различим в аудите/UI от GREEN.
- **TC-015 (TIMEOUT)**: verify-команда > 600s → `TIMEOUT`, completion блокирован; BVA: 599s GREEN-путь, 600s/601s — граница.

## FR-005 Destructive gate (T008–T009) — Risk 20

**DT-005 (Decision Table)** — условия: C1=deny-лист матч, C2=allowlist-исключение, C3=режим (PLAN/ACT), C4=подтверждение человека (one-shot жив):

| #   | C1  | C2  | C3   | C4                       | Ожидание                                                                  |
| --- | --- | --- | ---- | ------------------------ | ------------------------------------------------------------------------- |
| D1  | да  | нет | PLAN | —                        | **block навсегда** (деструктив запрещён в PLAN, `state-machine.ts:59-61`) |
| D2  | да  | нет | ACT  | нет                      | `AWAITING_TOOL_APPROVAL` + аудит                                          |
| D3  | да  | нет | ACT  | да (human)               | исполнение ровно этой команды (one-shot, кеш расходуется)                 |
| D4  | да  | да  | ACT  | —                        | allow (allowlist точнее deny) + аудит allow                               |
| D5  | нет | —   | ACT  | —                        | обычное исполнение                                                        |
| D6  | да  | нет | ACT  | да (**model** source)    | **reject + аудит** (SC-005 негатив: само-апрув модели)                    |
| D7  | да  | нет | ACT  | повторный вызов после D3 | новое подтверждение требуется                                             |

**ST-001 (State Transition)**: IDLE→PLANNING→AWAITING_PLAN_APPROVAL→ACTING→(gate block)→AWAITING_TOOL_APPROVAL→(human approve)→EXECUTING_TOOL→ACTING→…→(verify GREEN/SKIPPED)→TASK_COMPLETE; (verify RED/TIMEOUT)→ACTING; (reject)→ACTING; ERROR из EXECUTING_TOOL. Каждая дуга — unit-тест (`state-machine-gates.test.ts`).

- **TC-016..019**: D1..D4/D6/D7 как исполняемые кейсы; one-shot-кеш проверяется дважды (детерминизм NFR-002).

**EC-005 (Exploratory Charter, Error Guessing)** — «Побег из гейтов»: 45-минутная сессия без скрипта: попытки (а) самоподтверждение всеми каналами модели, (б) обфускация деструктива (кавычки, подстроки, `base64`, symlink), (в) race двух сессий на один one-shot-апрув, (г) вынос секретов через имена файлов. Критерий стоп: любой прорыв = CRITICAL баг, реализация блокируется до фикса. Charter живёт в этом файле, результаты — в qa/signoff-report.md (stage 8.5).

## FR-006 Secret guard (T010)

- **TC-020 (EP: deny-чтение)**: чтение `.env`, `.env.local`, `id_rsa`, `~/.ssh` → block + аудит.
- **TC-021 (маскирование до записи)**: событие с `KEY=SECRET` → в аудите хеш/маска; БД-скан не находит сырого секрета.

## FR-007 Dependency gate (T011)

- **TC-022 (offline)**: манифест + новый пакет, сеть off → install отклонён до решения; decision помечен `unverified_registry=true`.
- **TC-023 (pin enforcement)**: `approve+pin` на X → только X ставится; unpinned/другая версия → block + аудит; после `deny` повторная правка требует нового решения.

## FR-008 Policy & override (T012)

- **TC-024**: отключение клапана через конфиг → аудит `valve_config_change`; попытка disable G2/G3/G4/G5 → отклонена валидацией политики (SC-007); fresh install → все клапаны on.

## NFR bench

- **TC-BENCH-01**: гейт p95 < 50 мс / p99 < 100 мс (3 прогрева, 30 прогонов, ubuntu-latest).
- **TC-BENCH-02**: чекпоинт p95 < 500 мс на репо ≤ 10k файлов.
- **TC-BENCH-03**: медиана оверхеда ≤ 5% wall-clock по golden benign set (10 задач).

## SC-покрытие

SC-001→TC-001..004 · SC-002→TC-005..007 · SC-003→TC-009..010 · SC-004→TC-013..014 · SC-005→D6/TC-018 · SC-006→TC-022..023 · SC-007→TC-024 · SC-008→TC-BENCH-03+RS-001.
