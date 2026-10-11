# CLI Interface Contracts: Stack-Aware Agent Fleet Synchronization

> "В умелых руках и гаечный ключ — саксофон, а в кривых руках — публичный контракт сыплется на первом же вызове. Четкие флаги, строгие типы, предсказуемые exit-коды." — Валера

**Feature**: `003-stack-aware-agents`
**Date**: 2026-10-10, rev 2 — 2026-10-11
**Status**: Completed (rev 2)

---

## 1. Commands & Options

Бинарник пакета — `helpers`. `npx clai-helpers` в README — алиас документации, а не второй `bin`.

### `helpers sync` (флаг `--update-stack`)

```bash
helpers sync [--update-stack] [--dry-run] [--offline]
```

- `--update-stack` объявляется в `defineCommand` команды `sync` (`cli/sync.ts`), не в корневом `cli.ts`. Выполняет обычный sync, а для стековых агентов со статусом `managed` считает дельту (FR-003), пишет строку `skills:` первого frontmatter-блока и сохраняет привязку `stack` в lock (FR-005). Тело `STACK_RULES` не меняется.
- Без флага: для привязанных агентов применяет сохранённую привязку к новому апстримному рендеру; манифесты и матрицу не читает.
- `--dry-run` (глобальный): печатает план и для каждого стекового агента старую и новую строку; не пишет ни файлы, ни lock.
- `--offline` (глобальный): источник шаблона берётся из кэша giget.
- Повторный `--update-stack` на тех же входах даёт тот же файл и тот же lock.

### `helpers doctor --stack`

```bash
helpers doctor --stack [--json] [--verbose]
```

- Только стековая проверка (FR-006); проверки system, tools, mcp, keys, structure и drift не запускаются.
- Для непривязанных агентов — режим preview (findings `preview`, LOW).
- `--json` (собственный флаг `doctor`) печатает `StackDriftReport` (data-model.md), а не таблицу `DoctorResult`.
- `--verbose` (глобальный) дополнительно печатает обнаруженные пакеты `eco:name` и их спецификаторы.

### `helpers doctor` без `--stack`

- Поведение 1.0.0: проверка `drift.status` запускает `status --strict`. Если есть привязки и стековый HIGH, проверка падает (exit 1), в detail — `Run 'helpers doctor --stack' for details`.

### `helpers status --strict`

```bash
helpers status --strict [--json]
```

- Файловый drift — как в 1.0.0; для привязанных записей строка `skills:` нормализована в каноническом хеше.
- Стековая проверка FR-006 — только если в lock есть хотя бы одна привязка и `helpers-stack.json` не выключил фичу.
- Exit `2` (`ExitCode.DriftDetected`) — при файловом drift или стековом HIGH. Отдельный код не вводится.
- `--json` в любом режиме печатает тот же массив `StatusEntry`, что в 1.0.0. Причину стекового exit 2 показывает `helpers doctor --stack --json`. В человеческом выводе — блок `[stack]`.

### `helpers diff`

- Для привязанных агентов применяет привязку к апстримному рендеру перед сравнением, поэтому строка `skills:` не висит вечным diff.

### `helpers regen` (апстрим-режим, UndeRoute)

- Если есть `.claude/stack-matrix.json`, проверяет его по FR-009; ошибка — exit 1.

---

## 2. Exit Codes (enum `ExitCode`, `src/types/common.ts`)

| Code | Enum            | `sync`                                                                                                                                                                                                                    | `status --strict`                                                | `doctor --stack`                                                | `regen`                         |
| ---- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| 0    | `Success`       | Записано, dry-run или писать нечего                                                                                                                                                                                       | Нет файлового drift и нет стекового HIGH                         | Нет HIGH (MEDIUM, LOW и warn допустимы)                         | Матрица валидна или отсутствует |
| 1    | `UsageError`    | Нет lock; self-sync guard; непарный, вложенный или повторный слот; потеря непустого именованного слота; `malformed_frontmatter`; ошибка схемы матрицы или override; `--update-stack` при `enabled: false` или без матрицы | Нет lock; ошибка схемы матрицы или override при наличии привязок | Ошибка схемы матрицы или override                               | Матрица не проходит FR-009      |
| 2    | `DriftDetected` | —                                                                                                                                                                                                                         | Файловый drift или стековый HIGH                                 | Любой HIGH, включая `unbalanced_slot` и `malformed_frontmatter` | —                               |
| 3    | `StaleJournal`  | Незавершённый journal                                                                                                                                                                                                     | —                                                                | —                                                               | —                               |
| 10   | `InternalError` | IO-ошибка; расхождение YAML-проверки после рендера                                                                                                                                                                        | IO-ошибка                                                        | IO-ошибка                                                       | IO-ошибка                       |

Битый манифест — всегда warn, а не exit 1.

---

## 3. Files

| Path                                           | Владелец               | Кто пишет         | Формат                             |
| ---------------------------------------------- | ---------------------- | ----------------- | ---------------------------------- |
| `.claude/stack-matrix.json`                    | Шаблон (managed)       | `sync` (identity) | JSON `StackMatrix`                 |
| `helpers-stack.json`                           | Консьюмер (коммитится) | Человек           | JSON `StackOverride`               |
| `helpers-lock.json` → `files[].stack`          | CLI                    | `sync`            | `StackBinding`                     |
| Строка `skills:` в `.claude/agents/<agent>.md` | CLI (вычисляемое поле) | `sync`            | `SKILLS_LINE_FORMAT` по пробе T003 |

---

## 4. Human Output

```text
[doctor:stack] matrix .claude/stack-matrix.json (10 rules) · override: none · mode: git · manifests: 2
[DRIFT: UNMAPPED] .claude/agents/backend-specialist.md: nestjs-expert (rule nestjs: npm:@nestjs/core)
[DRIFT: ORPHANED] .claude/agents/database-architect.md: prisma-expert (rule prisma did not fire)
Run 'helpers sync --update-stack' to re-apply the stack binding.
```

Прочие префиксы: `[DRIFT: MISSING_BASE]`, `[DRIFT: UNEXPECTED]`, `[ERROR] Malformed frontmatter`, `[ERROR] Unbalanced slot`, `[WARN] <MEDIUM-finding или предупреждение сканера>`, `[PREVIEW]`. `sync --update-stack` печатает строки с префиксом `[sync:stack]`.

---

## 5. JSON (`helpers doctor --stack --json`)

```json
{
  "schema": 1,
  "matrix": ".claude/stack-matrix.json",
  "override": null,
  "mode": "git",
  "manifests": ["apps/api/package.json", "package.json"],
  "warnings": [],
  "findings": [
    {
      "type": "unmapped_stack",
      "severity": "HIGH",
      "agentFile": ".claude/agents/backend-specialist.md",
      "skillName": "nestjs-expert",
      "ruleId": "nestjs",
      "packageName": "npm:@nestjs/core",
      "message": "Rule nestjs fired but nestjs-expert is not on the skills: line",
      "remediation": "Run helpers sync --update-stack"
    },
    {
      "type": "orphaned_stack",
      "severity": "HIGH",
      "agentFile": ".claude/agents/database-architect.md",
      "skillName": "prisma-expert",
      "ruleId": "prisma",
      "message": "prisma-expert is on the skills: line but rule prisma did not fire",
      "remediation": "Run helpers sync --update-stack"
    }
  ],
  "hasDrift": true,
  "exitCode": 2
}
```

Абсолютных путей и времени нет (NFR-002). `status --json` этот объект не печатает.
