# Data Model: Stack-Aware Agent Fleet Synchronization

> "'Ну и запросы у вас...' — сказала база данных и зависла. В чём сила, кодер? Сила в типах, чистых контрактах и детерминированном стейте." — Валера

**Feature**: `003-stack-aware-agents`
**Date**: 2026-10-10, rev 2 — 2026-10-11
**Status**: Completed (rev 2)

---

## 1. Entities & Data Structures

### Common: роли и имена

```typescript
export type Role = "frontend" | "backend" | "database" | "test";

/** id правил, имена скиллов и mutexGroup: ^[a-z0-9]+(-[a-z0-9]+)*$, не длиннее 64 символов. */
export type Slug = string;
```

---

### Entity: `StackMatrix` (`.claude/stack-matrix.json`, шаблон, managed)

Правила «пакет/маркер → скиллы». Нормативное содержимое v1 — таблица в spec FR-002.

```typescript
export interface StackMatrix {
  readonly schema: 1;
  /** Роль → имя файла агента в `.claude/agents/` без `.md`. */
  readonly agents: Readonly<Record<Role, string>>;
  readonly budget: StackBudget;
  /** Отсортированы по `id` (code units). */
  readonly rules: readonly TechSkillMapping[];
}

export interface StackBudget {
  /** Максимум имён в эффективной строке. По умолчанию 15, допустимо 1..32 (Claude Code предзагружает не больше 32). */
  readonly maxSkills: number;
  /** Максимум суммарных байт `SKILL.md` эффективной строки. По умолчанию 98304. */
  readonly maxPreloadBytes: number;
}

export interface TechSkillMapping {
  readonly id: Slug;
  /** Имена с экосистемой: `npm:<name>`, `pypi:<имя после PEP 503>`. */
  readonly packages?: readonly string[];
  /** Repo-relative шаблоны: `*` внутри сегмента, ведущий `**/`. Только факт наличия. */
  readonly files?: readonly string[];
  /** Может быть пустым: тогда правило участвует только в `mutexGroup`. */
  readonly skills: readonly Slug[];
  readonly roles: readonly Role[];
  readonly mutexGroup?: Slug;
  readonly description: string;
}
// Инвариант: задан хотя бы один из `packages` и `files`.
```

Фрагмент файла (полный набор правил — spec FR-002):

```json
{
  "schema": 1,
  "agents": {
    "frontend": "frontend-specialist",
    "backend": "backend-specialist",
    "database": "database-architect",
    "test": "test-engineer"
  },
  "budget": { "maxSkills": 15, "maxPreloadBytes": 98304 },
  "rules": [
    {
      "id": "drizzle",
      "packages": ["npm:drizzle-orm"],
      "files": [
        "**/drizzle.config.js",
        "**/drizzle.config.mjs",
        "**/drizzle.config.cjs",
        "**/drizzle.config.ts"
      ],
      "skills": [],
      "roles": ["database"],
      "mutexGroup": "orm",
      "description": "Drizzle ORM: no dedicated skill, participates in the orm mutex"
    },
    {
      "id": "prisma",
      "packages": ["npm:prisma", "npm:@prisma/client"],
      "files": ["**/prisma/schema.prisma"],
      "skills": ["prisma-expert"],
      "roles": ["database"],
      "mutexGroup": "orm",
      "description": "Prisma ORM"
    }
  ]
}
```

---

### Entity: `StackOverride` (`helpers-stack.json`, консьюмер, коммитится)

```typescript
export interface StackOverride {
  readonly schema: 1;
  /** По умолчанию true. false — привязки не применяются и не проверяются. */
  readonly enabled?: boolean;
  /** Правило удаляется целиком; его имена перестают быть gated. */
  readonly disableRules?: readonly Slug[];
  /** Новый `id` добавляет правило, существующий — заменяет. */
  readonly rules?: readonly TechSkillMapping[];
  /** mutexGroup → id правила, которое побеждает в группе. */
  readonly pin?: Readonly<Record<Slug, Slug>>;
  readonly budget?: Partial<StackBudget>;
  readonly scan?: { readonly exclude?: readonly string[] };
}
```

---

### Entity: `StackManifest`

Результат обнаружения и парсинга (FR-001). В lock не пишется.

```typescript
export interface StackManifest {
  readonly mode: "git" | "walk";
  /** Repo-relative POSIX-пути разобранных манифестов, отсортированы. */
  readonly manifests: readonly string[];
  /** `eco:name` → отсортированные сырые спецификаторы из всех манифестов. */
  readonly packages: Readonly<Record<string, readonly string[]>>;
  /** Только имена с двумя и более разными известными major. */
  readonly versionConflicts: ReadonlyArray<{
    readonly name: string;
    readonly majors: readonly number[];
  }>;
  /** Обнаруженные пути (после глубины и denylist) для шаблонов `files`, отсортированы. */
  readonly files: readonly string[];
  readonly warnings: readonly StackWarning[];
}

export interface StackWarning {
  readonly code:
    "malformed_manifest" | "symlink_escape" | "oversize" | "manifest_cap" | "not_git_repo";
  readonly path?: string;
}
```

---

### Entity: `AgentSkillPlan`

Расчёт FR-003 для одного агента. Целиком в lock не пишется.

```typescript
export interface AgentSkillPlan {
  readonly role: Role;
  /** `.claude/agents/<name>.md` */
  readonly agentFile: string;
  /** Апстримная строка без дублей. */
  readonly base: readonly Slug[];
  readonly gated: readonly Slug[];
  /** Сработавшие и не подавленные правила роли, только имена из каталога. */
  readonly fired: readonly Slug[];
  readonly add: readonly Slug[];
  readonly remove: readonly Slug[];
  /** Имена, убранные из `add` бюджетом. */
  readonly dropped: readonly Slug[];
  /** `base` без `remove`, затем `add` без `dropped`. */
  readonly effective: readonly Slug[];
}
```

---

### Entity: `StackBinding` (`helpers-lock.json` → `files[].stack`)

Необязательное поле записи агента (`SourceEntry`). Схема lock остаётся `1`.

```typescript
export interface StackBinding {
  /** Base на момент последнего sync. Обновляет любой sync. */
  readonly base: readonly Slug[];
  /** Пересчитывает только `sync --update-stack`; голый sync применяет как есть. */
  readonly add: readonly Slug[];
  readonly remove: readonly Slug[];
}

// src/types/lock.ts
export interface SourceEntry {
  // …существующие поля…
  /** Есть — запись привязана: строка `skills:` нормализуется в каноническом хеше. */
  stack?: StackBinding;
}
```

Пример записи lock (сценарий 1 US1):

```json
{
  "path": ".claude/agents/backend-specialist.md",
  "kind": "source",
  "class": "core",
  "status": "managed",
  "sourceCanonicalHash": "sha256:…",
  "localCanonicalHash": "sha256:…",
  "stack": {
    "base": [
      "clean-code",
      "nodejs-best-practices",
      "python-patterns",
      "api-patterns",
      "database-design",
      "system-design-patterns",
      "mcp-builder",
      "lint-and-validate",
      "knowledge-adaptation",
      "ai-engineering-hygiene"
    ],
    "add": ["nestjs-expert"],
    "remove": ["python-patterns", "mcp-builder"]
  }
}
```

---

### Entity: `NamedSlot`

Грамматика маркеров (FR-007), одна для `core/slots.ts` и `core/hash.ts`.

| Стиль                 | START                                   | END                                   |
| --------------------- | --------------------------------------- | ------------------------------------- |
| md / html             | `<!-- HELPERS:CUSTOM START[: NAME] -->` | `<!-- HELPERS:CUSTOM END[: NAME] -->` |
| yaml / sh / py / toml | `# HELPERS:CUSTOM START[: NAME]`        | `# HELPERS:CUSTOM END[: NAME]`        |
| js / ts / jsonc       | `// HELPERS:CUSTOM START[: NAME]`       | `// HELPERS:CUSTOM END[: NAME]`       |

- `NAME` = `[A-Z][A-Z0-9_]{0,31}`; у END то же имя, что у START. Без имени — безымянный слот, как в 1.0.0.
- Слияние: именованные — по имени, безымянные — по порядковому номеру среди безымянных.
- Ошибки: повтор имени в файле, непарный START или END, вложенность, END с другим именем.
- Зарезервировано: `STACK_RULES` в теле четырёх стековых агентов.

---

### Entity: `StackDriftReport`

Результат `helpers doctor --stack` (FR-006). `status --json` его не печатает.

```typescript
export type StackFindingType =
  // HIGH
  | "unmapped_stack"
  | "orphaned_stack"
  | "missing_base"
  | "unexpected_skill"
  | "malformed_frontmatter"
  | "unbalanced_slot"
  // MEDIUM
  | "ambiguous_stack"
  | "version_conflict"
  | "missing_skill_catalog"
  | "skill_budget"
  | "order_only"
  | "agent_missing"
  | "matrix_missing"
  // LOW
  | "preview";

export interface StackDriftFinding {
  readonly type: StackFindingType;
  /** Определяется типом, см. группы выше. */
  readonly severity: "HIGH" | "MEDIUM" | "LOW";
  readonly agentFile?: string;
  readonly skillName?: Slug;
  readonly ruleId?: Slug;
  readonly packageName?: string;
  readonly message: string;
  readonly remediation: string;
}

export interface StackDriftReport {
  readonly schema: 1;
  /** `.claude/stack-matrix.json` или null, если файла нет. */
  readonly matrix: string | null;
  /** `helpers-stack.json` или null. */
  readonly override: string | null;
  readonly mode: "git" | "walk";
  readonly manifests: readonly string[];
  readonly warnings: readonly StackWarning[];
  /** Сортировка: agentFile, type, skillName (code units). */
  readonly findings: readonly StackDriftFinding[];
  /** true, если есть HIGH. */
  readonly hasDrift: boolean;
  readonly exitCode: 0 | 2;
}
```

Абсолютных путей и времени в отчёте нет (NFR-002).

---

## 2. State Transitions & Lifecycle

```text
[шаблон] .claude/agents/*.md (строка skills: = base) + .claude/stack-matrix.json
        │  helpers sync (fetch + render)
        ▼
[рендер агента] base := апстримная строка skills: без дублей
        │
        ├── агент не привязан ──────────────────► файл пишется как в 1.0.0
        │
        ├── sync --update-stack ──► discover → manifests → plan (FR-003)
        │                               └─► stack { base, add, remove } в lock
        │
        └── агент привязан, голый sync ──► сохранённые add/remove к новому base
                                            │
                                            ▼
        [файл] skills: = эффективная строка; [lock] stack + нормализованные хеши
                                            │
        doctor --stack / status --strict (только при привязках)
                                            ▼
        ожидаемая строка (текущие входы + lock.stack.base) vs фактическая
        - есть HIGH → exit 2
        - только MEDIUM, LOW или warn → exit 0
```
