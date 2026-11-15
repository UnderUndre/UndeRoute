# Implementation Plan: 006-constitution-wiring-fix

> "Тяжесть — это надёжно. Даже если не выстрелит, таким всегда можно врезать по башке." — Борис Бритва (_Snatch_, в защиту монолита)
> "Какое ТЗ — такое и ХЗ." — Folk Wisdom

**Branch**: `specs/006-constitution-wiring-fix` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-constitution-wiring-fix/spec.md` (clarified 2026-11-15, requirements-audit PASS `61406f2e31`)

## Summary

Чинит 11 находок форензик-аудита обвязки конституции v1.9.0: подключает заявленные, но не припаянные enforcement-провода (analyze XII RTM+evidence, Intent Routing канон в AGENTS.md, snapshot stage-list), делает always-on документацию правдивой (v1.9.1 amend, dangling refs, IX claim) и закрывает completeness-гэп (Principle XIV Stage Checklists, knowledge bootstrap, dual-role note). Ноль runtime-поверхности: только `.md`/`.json`/`.sh`/`.ps1` конфиги. Подход: правки группируются так, чтобы shared-file race был невозможен по построению: все конституционные правки = один amend-коммит v1.9.1 (Governance §2), AGENTS.md/CLAUDE.md правки сшиты внутри одной [DOC] lane с явными зависимостями.

## Technical Context

**Language/Version**: Markdown, Bash (snapshot-stage.sh), PowerShell 5.1+ (snapshot-stage.ps1), JSON (settings.json — не меняется)
**Primary Dependencies**: ноль новых (supply chain: NFR-003; единственный инструмент — существующий `clai-helpers` CLI для sync, уже в devDeps)
**Storage**: N/A (файлы репо; `knowledge/patterns/INDEX.md` — плоский маркер-стаб)
**Testing**: grep/командно-исполнимые AC (см. `qa/preliminary-rtm.md`, 18/18); exit-code тесты snapshot-скрипта; `git diff --name-only` path-фильтр для NFR-003
**Target Platform**: Windows 10/11 + Git Bash (основная среда владельца); скрипты должны оставаться совместимы с POSIX bash (существующий канон `set -euo pipefail`)
**Project Type**: repo-config chore (AI-контур репо)
**Performance Goals**: N/A (документация); единственный «перф»-параметр — token budget NFR-001 (AGENTS.md ≤ +60 строк, constitution ≤ +50 строк вне changelog)
**Constraints**: NFR-003 (ноль изменений под `src/`, `packages/`, `electron/`, `docker/`, `.github/workflows/`); Governance §2 (конституционные правки одним amend-коммитом); NFR-005 (Intent Routing ровно в одном always-on файле)
**Scale/Scope**: 13 FR / 5 NFR / 19 tasks / 4 фазы; ~10 файлов репо
**Security Surface & STRIDE Triggers**: N/A (docs/config; условие Q1a снято на clarify — GHA workflow не создаётся; supply-chain правило pinned-actions остаётся для будущих спек)
**Database Migration Trigger**: N/A (No DB changes)
**Supply Chain & Licensing**: ноль новых зависимостей; лицензии репо не затрагиваются; `npm audit` не требуется (нет package.json изменений)
**Research Spikes & Disposal**: ноль спайков (все решения приняты на clarify 2026-11-15, см. research.md)

## Constitution Check

_GATE: прогнан против `.specify/memory/constitution.md` v1.9.0. Re-check после Phase 1: без изменений (дизайн не меняет архитектуры)._

| Principle                           | Вердикт               | Обоснование                                                                                                                                                                                                                                                                        |
| :---------------------------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Source of Truth Discipline       | PASS                  | Правки идут в SOURCE (`.claude/commands/*.md`), не в generated-деревья. После правок commands обязателен `npx clai-helpers sync` + `status --strict` (задача T017) — иначе drift. AGENTS.md/CLAUDE.md не входят в transpile-set (не sources), хуки не транслируются по VIII hybrid |
| II. Transformer, Not Fork           | PASS                  | Новых деревьев не создаётся                                                                                                                                                                                                                                                        |
| III. Protected Slots                | PASS                  | Generated-файлы не hand-edited                                                                                                                                                                                                                                                     |
| IV. SemVer 0.x                      | PASS (deferred)       | Изменения шаблона классифицируются на `/bump` (ожидаемо MINOR: новое поведение XII-wiring; не breaking — старые имена стадий сохранены NFR-004). Бамп вне скоупа этой спеки                                                                                                        |
| V. Token Economy                    | PASS                  | NFR-001 бюджетирует дельту always-on слоя; dual-role note (FR-011) разрешает конфликт «inventory vs consumer»                                                                                                                                                                      |
| VI. Cross-AI Review Gate            | ACTIVE                | Пайплайн сам является носителем: analyze → review ×2 → implement                                                                                                                                                                                                                   |
| VII. Artifact Versioning            | PASS                  | plan/tasks тегируются скриптом; requirements-audit/analyze — вручную до фикса FR-003 (прецедент 004, задокументировано)                                                                                                                                                            |
| VII-B. Business Plan Stage          | PASS (waived)         | `business-plan-waiver.md` (chore-only, VII-B.5)                                                                                                                                                                                                                                    |
| VIII. Self-Maintaining Knowledge    | PASS                  | FR-009 оживляет mechanism #4; VIII не блокирует implement                                                                                                                                                                                                                          |
| IX. Two-Phase Review Flow           | ACTIVE                | Планирование на `specs/006-...`; реализация на `006-...` от main после merge planning PR                                                                                                                                                                                           |
| X. Zero-Downtime Data               | N/A                   | Нет DB                                                                                                                                                                                                                                                                             |
| XI. Spike Governance                | N/A                   | Нет спайков                                                                                                                                                                                                                                                                        |
| XII. QA Contour                     | PASS (partial waiver) | `qa/waiver.md`: test-design + qa-signoff waived; requirements-audit PASS `61406f2e31`; analyze остаётся гейтом                                                                                                                                                                     |
| XIII. Agent Execution Safety Valves | N/A                   | Рантайм-клапаны не затрагиваются (FR-010 удаляет незарегистрированный файл, не клапан)                                                                                                                                                                                             |

Violations: нет. Complexity Tracking: пусто (нарушений, требующих обоснования, не обнаружено).

## Project Structure

### Documentation (this feature)

```text
specs/006-constitution-wiring-fix/
├── spec.md                    # specify (a528d2262b)
├── business-plan-waiver.md    # VII-B.5
├── qa/waiver.md               # XII partial waiver
├── qa/preliminary-rtm.md      # requirements-audit (61406f2e31)
├── requirements-audit.md      # PASS
├── plan.md                    # этот файл
├── research.md                # Phase 0: решения (все приняты на clarify)
├── tasks.md                   # Phase 2 (/speckit.tasks)
├── reviews/analyze.md         # self-consistency gate
└── verification/              # evidence-артефакты implement-фазы (XII.4)
    ├── baseline.md            # T001: фото «до»
    ├── amend-bundle.md        # T002: манифест amend-коммита
    └── sc-checklist.md        # T018: прогон SC-001..005
```

### Source Code (repository root)

```text
Ноль runtime-кода (NFR-003). Затрагиваемые конфиги:
.claude/commands/{speckit.analyze,speckit.plan,speckit.qa-signoff,dispatch}.md
.claude/hooks/intent-hint.sh                      # комментарий (CC-only, не транслируется)
.claude/hooks/dialog-capture.mjs                  # удаляется (FR-010)
.specify/scripts/bash/snapshot-stage.sh           # FR-003
.specify/scripts/powershell/snapshot-stage.ps1    # FR-003
.specify/memory/constitution.md                   # amend v1.9.1 (один коммит)
AGENTS.md                                         # §Intent Routing + удаление §Base-green check (:571)
CLAUDE.md                                         # удаление секций Base-green + Superpowers/_tasks
knowledge/patterns/INDEX.md                       # новый стаб (FR-009)
specs/main/architecture.md                        # §6 feature-reference row 006 (Polish)
```

**Structure Decision**: изменение по месту, без новых модулей; единственный новый файл — `knowledge/patterns/INDEX.md` (VIII staging) и evidence-артефакты в `specs/006-.../verification/`.

## Design Decisions (ADR)

- **ADR-001 (Amend bundle)**: все 5 конституционных правок (FR-004/005/008/011/013) = один amend-коммит v1.9.1 вместе с зависимыми `speckit.plan.md`/`speckit.qa-signoff.md`. Rationale: Governance §2 требует amend в одном коммите с зависимыми файлами; это же устраняет shared-file race на constitution.md. Alternatives: отдельные коммиты на FR — отвергнуто (нарушение §2 + 5 задач в одном файле = гонка).
- **ADR-002 (Single routing source)**: таблица Intent Routing живёт в AGENTS.md; intent-hint.sh остаётся дублирующим regex-фильтром с комментарием-ссылкой; CLAUDE.md не получает дубликатов. Rationale: NFR-005; AGENTS.md — единственный always-on слой, который читают все хосты.
- **ADR-003 (Precedence формула)**: конституция приоритетна в процессных вопросах (гейты, стадии, артефакты, версии, теги); AGENTS.md приоритетен в продуктовых конвенциях кода; прямой конфликт процессных правил решает конституция. Подтверждено владельцем (Q8).
- **ADR-004 (base-green: полное удаление без deprecation-периода)**: практика отменена владельцем (Q3); файл-опора никогда не существовал, операционной практики нет — некому сломаться. Alternatives: deprecated-период — отвергнут (нет пользователей практики).
- **ADR-005 (Manual stage-tags до FR-003)**: теги `requirements-audit/...` и `analyze/...` ставятся вручную в этой спеке (скрипт не знает стадий — находка №11); после реализации FR-003 скрипт берёт на себя. Прецедент: пайплайн 004 (теги вручную).
- **ADR-006 (\_*-канон не трогается)**: AGENTS.md §Planning & Research Artifacts + Hard Rule #23 (`_tasks` приватный present-or-future gitignored-репо) остаются; выпиливается только таблица путей из CLAUDE.md (Q5). Rationale: AGENTS.md-канон не dangling, он описывает договорённость, а не существующий файл.

## Threat Modeling & Security Boundaries (STRIDE)

**STRIDE: N/A (docs/config)** — ноль сетевых эндпоинтов, auth/tokens, криптографии, PII. Условие Q1a (GHA workflow) снято на clarify. Единственное supply-chain замечание — pin-actions правило для будущих спек (зафиксировано в spec §STRIDE).

## Database Migration Strategy (Expand/Contract)

**N/A** — ноль изменений схемы.

## Observability, Recovery & Rollback Plan

### Observability & Telemetry

- N/A для runtime (ноль телеметрии). Верификационная «наблюдаемость» = evidence-артефакты `verification/` (baseline → sc-checklist), каждый AC с выводом команды (XII.4).

### Disaster Recovery & Rollback Strategy

- **Recovery Targets**: N/A (нет сервиса); RTO=0 для репо-артефактов.
- **Rollback Procedure**: каждый логический коммит точечен; откат любого артефакта = `git revert <commit>`; amend-коммит v1.9.1 откатывается целиком (атомарность — свойство ADR-001).
- **Rollback Triggers**: провал любого AC на T018/T019 (SC-001..005 чек-лист красный) → fix-pass до зелёного, без merge.

## Complexity Tracking

Пусто: нарушений Constitution Check, требующих обоснования, не обнаружено.
