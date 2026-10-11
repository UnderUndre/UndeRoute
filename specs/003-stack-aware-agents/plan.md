# Implementation Plan: Stack-Aware Agent Fleet Synchronization

> "Тяжесть — это надёжно. Даже если не выстрелит, таким всегда можно врезать по башке." — Борис Бритва (_Большой куш / Snatch_, в защиту монолита)
> "These walls are funny. First you hate 'em, then you get used to 'em. Enough time passes, you get so you depend on them." — _Побег из Шоушенка_
> "Scissors cuts paper, paper covers rock, rock crushes lizard... — Распределённый дедлок в микросервисах." — Шелдон Купер (_The Big Bang Theory_)

**Branch**: `specs/003-stack-aware-agents` (UndeRoute; создаёт T001) | **Date**: 2026-10-10, rev 2 — 2026-10-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-stack-aware-agents/spec.md`

---

## Summary

Статический сканер прямых зависимостей (tracked-файлы через `git ls-files`, TOML через `confbox`) сопоставляет стек с матрицей шаблона `.claude/stack-matrix.json` и для каждого из четырёх стековых агентов считает дельту к апстримной строке `skills:`: `remove` — стековые скиллы, для которых в репозитории нет стека, `add` — недостающие. `helpers sync --update-stack` пишет строку и сохраняет дельту в lock как привязку; любой следующий `sync`, в том числе голый, применяет её снова, поэтому строка переживает обычные синки. Канонический хеш привязанной записи нормализует строку, а саму строку проверяет стековый drift: `helpers doctor --stack` и `helpers status --strict` (только при наличии привязок, opt-in). Локальные правила живут в именованном слоте `STACK_RULES`, который шаблон объявляет в агентах; грамматика маркеров одна для `slots.ts` и `hash.ts`. Gemini и Copilot поле `skills` не получают.

---

## Technical Context

**Language/Version**: TypeScript 5.7 (как в devDependency пакета), Node.js >= 20.0.0
**Primary Dependencies**: уже в пакете — `citty`, `consola`, `c12`, `pathe`. Плюс `confbox` `^0.1.8` (MIT) прямой зависимостью: сейчас он приходит транзитивно через `c12@2.0.4`, новой версии и нового кода в install-tree нет. Добавление — с одобрения мейнтейнера (Standing Order 2, T004). `commander`, `picocolors` и самописный TOML-парсер не используются.
**Storage**: `.claude/stack-matrix.json` (шаблон, managed); `helpers-stack.json` (консьюмер, коммитится); поле `stack` в записях `helpers-lock.json` (схема lock остаётся 1); существующий journal `.helpers/journal.json`.
**Testing**: `vitest`: unit — `tests/unit/stack/`, интеграция — `tests/integration/stack/`, бенч — `tests/bench/`.
**Target Platform**: Node.js CLI (Linux, macOS, Windows). Команда — `helpers`, имя `clai-helpers` — только в README. Хук `agent-skills-reminder.sh` (bash + jq) по Principle VIII предназначен только для апстрима; фича от него не зависит, главный потребитель строки — нативный preload скиллов в Claude Code.
**Project Type**: CLI-пакет `underoute-clai` @ `1.0.0` (`packages/cli/`) и шаблон `.claude/` в самом UndeRoute. UndeRoute — апстрим: `helpers.config.ts` есть, `helpers-lock.json` нет, `helpers init` по умолчанию берёт `github:UnderUndre/UndeRoute`. Релиз — MINOR через `/bump` (ожидается `1.1.0`, Principle IV).
**Performance Goals**: NFR-001 — p95 < 150 мс и p99 < 300 мс на 10 000 tracked-файлов и 50 манифестах (`ubuntu-latest`).
**Constraints**: zero-eval; ≤ 15 имён и ≤ 96 КиБ preload на агента; ≤ 2 МиБ на манифест; глубина ≤ 4; ≤ 1000 манифестов.
**Scale/Scope**: монорепо в пределах глубины 4; экосистемы npm и PyPI; Go и Rust — вне релиза.
**Security Surface & STRIDE Triggers**: чтение чужих манифестов, symlink, запись frontmatter агента. Код репозитория не исполняется.
**Database Migration Trigger**: N/A (БД нет). Схема lock меняется только добавлением необязательного поля.
**Supply Chain & Licensing**: MIT; одна новая прямая зависимость без нового кода (`confbox`, MIT). `npm audit` — ноль High/Critical, AGPL/GPL нет (T038). Отдельного `check:licenses` в пакете нет: лицензии проверяются по `package.json` зависимостей.
**Research Spikes & Disposal**: единственный спайк — проба T003 (формат `skills` для preload в Claude Code): timebox 0.5 дня, метрика — число предзагруженных скиллов (ожидается 2 из 2), scratch-репо удаляется, в пакет ничего не попадает. Перф-спайка не было: цифры в research.md — оценка, а не валидация; NFR-001 подтверждает бенч T033, написанный с нуля.

---

## Repository Topology & Branch Flow

| Что                                                                        | Где                                        | Ветка                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Артефакты спеки                                                            | UndeRoute, `specs/003-stack-aware-agents/` | `specs/003-stack-aware-agents` (планирование)               |
| Код CLI (`packages/cli/`), шаблон (`.claude/`) и CI (`.github/workflows/`) | UndeRoute                                  | `003-stack-aware-agents` от `main` после merge планирования |

- Обе ветки — в одном репозитории; PR реализации ссылается на PR планирования; stage-теги ставятся в UndeRoute.
- Папка `repos/under-ai-helpers` в воркспейсе — устаревший неотслеживаемый снапшот предшественника (`0.6.0`; в `src/` отличаются только `cli/init.ts`, `core/manifest.ts` и `core/fleet/discovery.ts`): его не редактируют и не публикуют.
- База версии: `packages/cli/package.json` = `1.0.0` (выставлена вручную в `3006eac34`), а `packages/cli/CHANGELOG.md` заканчивается на `0.1.0`. Базу для `/bump` подтверждает мейнтейнер (T036).
- Сборку `packages/cli/` сейчас не запускает ни один workflow в `.github/workflows/`; T038 добавляет `helpers-cli.yml`.
- **Состояние на 2026-10-11**: артефакты в UndeRoute не закоммичены (`?? specs/003-stack-aware-agents/`), ветки планирования нет. Тег `review/003-stack-aware-agents/v1` стоит в родительском репо `UnderUndre` (5f75d99), где спеки нет, и считается недействительным. Закрывает T001, выполняет пользователь:

  ```bash
  cd UndeRoute
  git switch -c specs/003-stack-aware-agents
  git add specs/003-stack-aware-agents
  git commit -m "docs(specs): 003-stack-aware-agents rev 2"
  .specify/scripts/bash/snapshot-stage.sh spec 003-stack-aware-agents
  .specify/scripts/bash/snapshot-stage.sh plan 003-stack-aware-agents
  .specify/scripts/bash/snapshot-stage.sh tasks 003-stack-aware-agents
  ```

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Управляющая конституция — `UndeRoute/.specify/memory/constitution.md` **v1.7.1** (Last Amended 2026-10-11). Копия v1.5.0 в `repos/.specify/` устарела и не применяется.

- **I. Source of Truth**: PASS. Base — строка `skills:` апстримного `.claude/agents/*.md`, правила — `.claude/stack-matrix.json` шаблона; CLI только вычисляет. Generated-деревья стек не получают, трансформеры `claude-to-gemini-agent` и `claude-to-copilot-instructions` поле `skills` срезают.
- **II. Transformer, Not Fork**: PASS. Новых целей и копий `.claude/` нет.
- **III. Protected Slots**: PASS. Грамматика маркеров расширена именем, безымянные слоты работают как раньше. Строка `skills:` — вычисляемое поле привязки в lock; по уточнению III в конституции v1.7.1 это вывод пайплайна, а не override. Ручную правку ловит drift, а sync её перезаписывает.
- **IV. SemVer**: PASS. MINOR через `/bump` (ожидается `1.0.0` → `1.1.0`); поведение opt-in (NFR-005); migration note — T036. Правила IV написаны для 0.x, а пакет уже на `1.0.0`: фича без breaking change — MINOR и по обычному SemVer.
- **V. Token Economy**: PASS. Бюджет preload в байтах и именах (NFR-003); гейтинг убирает нерелевантные стековые скиллы.
- **VI. Cross-AI Review Gate**: OPEN. Нужны `analyze` PASS и не меньше двух внешних PASS на rev 2. `reviews/zcode.md` (до Q5) и `reviews/copilot.md` (CRITICAL на rev 1) относятся к прошлым ревизиям.
- **VII. Artifact Versioning**: **НАРУШЕН до T001**. Артефакты не закоммичены, stage-тегов в UndeRoute нет. `/speckit.implement` не запускается, пока T001 не выполнен.
- **VII-B. Business Plan**: PASS через waiver ([business-plan-waiver.md](business-plan-waiver.md)): внутренний tooling, не SKU.
- **VIII. Self-Maintaining Knowledge**: PASS. Фича не добавляет хуков и не зависит от них; опирается на нативный preload Claude Code.
- **IX. Two-Phase Review Flow**: PASS при выполнении T001 и T002: обе ветки — в UndeRoute («Repository Topology & Branch Flow»).
- **X. Zero-Downtime Data Architecture**: N/A — БД нет; изменение lock аддитивное (expand-only).
- **XI. Spike Governance**: PASS. Единственный спайк — T003 (timebox 0.5 дня, числовая метрика, утилизация, без тестов на спайк-код). Ранний замер из research.md помечен как оценка; NFR-001 валидирует T033.

---

## Project Structure

### Source Code (UndeRoute)

```text
.github/workflows/
└── helpers-cli.yml                      # validate/test/build/audit + stack-bench (T038)
.claude/
├── stack-matrix.json                    # матрица v1 (FR-002)
└── agents/                              # пустой слот STACK_RULES в 4 стековых агентах (FR-007)
packages/cli/src/
├── core/
│   ├── slot-markers.ts                  # единая грамматика маркеров (FR-007)
│   ├── slots.ts                         # именованные — по имени, безымянные — по порядку
│   ├── hash.ts                          # общая грамматика; нормализация skills: у привязанных записей
│   ├── drift.ts                         # флаг нормализации для записей со stack
│   └── stack/
│       ├── types.ts
│       ├── discover.ts                  # git ls-files / walker, глубина, denylist, realpath
│       ├── manifests.ts                 # npm + PyPI (confbox), PEP 503, major
│       ├── matrix.ts                    # .claude/stack-matrix.json + validateStackMatrix (FR-009)
│       ├── override.ts                  # helpers-stack.json
│       ├── plan.ts                      # base/gated/fired/add/remove/effective, бюджет
│       ├── frontmatter.ts               # writer строки skills:, YAML-проверка
│       ├── binding.ts                   # применение привязки в sync, lock.stack
│       └── drift.ts                     # findings FR-006, StackDriftReport
├── cli/
│   ├── sync.ts                          # --update-stack; проверка плана до записи
│   ├── status.ts                        # стек только при привязках; --json без изменений
│   ├── diff.ts                          # overlay привязки перед diff
│   ├── regen.ts                         # вызов validateStackMatrix
│   ├── doctor.ts                        # --stack
│   └── doctor/                          # types.ts (exitCode 0|1|2), checks/stack.ts, checks/drift.ts (подсказка)
└── types/lock.ts                        # SourceEntry.stack?: StackBinding
packages/cli/tests/
├── unit/stack/                          # matrix, discover, manifests, plan, frontmatter, drift, slots-sync
├── unit/slot-markers.test.ts
├── integration/stack/                   # lifecycle, status, slots
└── bench/stack-scan.bench.ts            # NFR-001, SC-002
```

---

## Threat Modeling & Security Boundaries (STRIDE)

| Threat Category (STRIDE)   | Target Component / Asset | Potential Attack Vector                                                       | Mitigation / Architecture Countermeasure                                                                                          |
| :------------------------- | :----------------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **S**poofing               | Каталог скиллов          | Имя скилла из манифеста ведёт на чужой путь                                   | Имена только из матрицы шаблона и `helpers-stack.json`, regex FR-002; путь скилла внутри `rootDir`                                |
| **T**ampering              | Парсер и конфиг          | Исполнение `next.config.js` или `helpers.config.ts` в CI                      | Только данные: JSON, TOML (`confbox`), построчный requirements; `helpers.config.ts` в stack, `status` и `doctor` не грузится      |
| **R**epudiation            | Lock и строка `skills:`  | Тихая правка строки мимо журнала                                              | `applySyncPlan` (journal + backup); lock `stack { base, add, remove }`; нормализованные хеши; идемпотентность                     |
| **I**nformation Disclosure | Symlink                  | Манифест-симлинк на `.env` или `.ssh`                                         | `realpath` внутри `rootDir`; только tracked-файлы; `.env` не читается                                                             |
| **D**enial of Service      | Обнаружение              | `node_modules`, циклы, гигантский JSON                                        | Глубина ≤ 4, denylist, 2 МиБ, ≤ 1000 манифестов                                                                                   |
| **E**levation of Privilege | Frontmatter агента       | Инъекция `tools`, `permissionMode`, `hooks` через имя скилла; обход self-sync | Regex имён, отказ на block-список и повтор ключа, YAML-проверка после рендера; self-sync guard выполняется раньше стековой записи |

---

## Database Migration Strategy (Expand/Contract)

> **Trigger**: N/A — схем БД нет. В lock добавляется необязательное поле `stack`, старые записи читаются как есть (expand-only).

---

## Observability, Recovery & Rollback Plan

### Observability & Telemetry

- **Terminal UI**: `consola`, префиксы `[sync:stack]`, `[doctor:stack]`, `[DRIFT: ORPHANED]`, `[DRIFT: UNMAPPED]`, `[DRIFT: MISSING_BASE]`, `[DRIFT: UNEXPECTED]`, `[ERROR]`, `[WARN]`, `[PREVIEW]`. `--verbose` печатает обнаруженные пакеты. Не `picocolors` напрямую.
- **Machine Output**: `doctor --stack --json` печатает `StackDriftReport`. `status --json` не меняется ни в одном режиме.
- Телеметрии и сетевых вызовов нет (NFR-004).

### Disaster Recovery & Rollback Strategy

- **Atomic Operations**: тот же `applySyncPlan` (staging, journal, commit); проверка всего плана до первой записи.
- **Rollback Path**: `helpers recover --rollback` восстанавливает backup из journal; новых флагов recover нет.
- **Opt-out**: `helpers-stack.json` с `"enabled": false`; после этого голый sync возвращает апстримные строки.
- **Idempotency**: повторный `helpers sync --update-stack` на тех же входах даёт тот же файл и тот же lock.

### Rollout & Compatibility

- Opt-in: до первого `--update-stack` поведение 1.0.0 (NFR-005, SC-005).
- Шаблон с матрицей и слотами `STACK_RULES` выходит вместе с CLI 1.1.0. CLI 1.1.0 со старым шаблоном: `--update-stack` — exit 1, `doctor --stack` — INFO.
- CLI ≤ 1.0.x на привязанном репозитории теряет привязку при sync; это и новая грамматика слотов — в migration note (T036).
