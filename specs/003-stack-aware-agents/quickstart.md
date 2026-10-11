# Quickstart & Tracer Bullet: Stack-Aware Agent Fleet Synchronization

> "Принцип Tracer Bullet: один сквозной эндпоинт от UI до БД и обратно, подтверждающий работоспособность до написания сотен фич." — ISO/IEC/IEEE 12207 Phase 3

**Feature**: `003-stack-aware-agents`
**Date**: 2026-10-10, rev 2 — 2026-10-11
**Status**: Ready (rev 2)

---

## 0. Фикстура

Трассер гоняется на консьюмер-фикстуре, а не на самом UndeRoute: UndeRoute — апстрим (`helpers.config.ts` есть, `helpers-lock.json` нет), поэтому `sync` и `status` там завершатся с exit 1.

```bash
mkdir stack-tracer && cd stack-tracer && git init
helpers init --source github:UnderUndre/UndeRoute   # шаблон с .claude/stack-matrix.json (выходит вместе с CLI 1.1.0)
cat > package.json <<'EOF'
{
  "name": "stack-tracer",
  "private": true,
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@nestjs/core": "^11.0.0",
    "drizzle-orm": "^0.36.0"
  }
}
EOF
git add -A
```

В git-режиме сканер видит только tracked-файлы, поэтому `package.json` нужно добавить в индекс. До релиза 1.1.0 трассер гоняется собранным CLI из ветки реализации (`node <UndeRoute>/packages/cli/bin/helpers.mjs`), а `init` получает `--ref 003-stack-aware-agents` (T037).

---

## 1. Preview (привязок ещё нет)

```bash
helpers doctor --stack
```

```text
[doctor:stack] matrix .claude/stack-matrix.json (10 rules) · override: none · mode: git · manifests: 1
[PREVIEW] .claude/agents/backend-specialist.md: -python-patterns -mcp-builder +nestjs-expert
[PREVIEW] .claude/agents/frontend-specialist.md: -tailwind-patterns (duplicate frontend-design collapsed)
[PREVIEW] .claude/agents/test-engineer.md: -webapp-testing
```

Exit 0. `helpers status --strict` ведёт себя как в 1.0.0.

---

## 2. Применение

```bash
helpers sync --update-stack
```

```text
[sync:stack] .claude/agents/backend-specialist.md skills: clean-code, nodejs-best-practices, api-patterns, database-design, system-design-patterns, lint-and-validate, knowledge-adaptation, ai-engineering-hygiene, nestjs-expert
[sync:stack] .claude/agents/database-architect.md unchanged
[sync:stack] .claude/agents/frontend-specialist.md skills: clean-code, react-patterns, nextjs-best-practices, frontend-design, lint-and-validate, knowledge-adaptation, ai-engineering-hygiene
[sync:stack] .claude/agents/test-engineer.md skills: clean-code, testing-patterns, tdd-workflow, code-review-checklist, lint-and-validate, ai-engineering-hygiene
[sync:stack] binding saved to helpers-lock.json (4 agents)
```

Формат строки задаёт `SKILLS_LINE_FORMAT` по пробе T003; выше показан CSV.

```bash
helpers status --strict        # exit 0
helpers sync                   # привязка применена снова, строки те же
helpers status --strict        # exit 0
```

---

## 3. Дрейф стека

Заменить в `package.json` `drizzle-orm` на `prisma`, убрать `@nestjs/core`, затем `git add package.json`.

```bash
helpers doctor --stack
```

```text
[DRIFT: ORPHANED] .claude/agents/backend-specialist.md: nestjs-expert (rule nestjs did not fire)
[DRIFT: UNMAPPED] .claude/agents/database-architect.md: prisma-expert (rule prisma: npm:prisma)
Run 'helpers sync --update-stack' to re-apply the stack binding.
```

Exit 2. `helpers status --strict` тоже даёт 2, а `helpers status --json` остаётся массивом. Исправление — `helpers sync --update-stack`, после него `status --strict` снова 0. Если в `package.json` одновременно есть `prisma` и `drizzle-orm`, `doctor --stack` печатает `[WARN] ambiguous_stack (orm)` и не добавляет `prisma-expert`, пока в `helpers-stack.json` не задан `"pin": { "orm": "prisma" }`.

---

## 4. Локальные правила (`STACK_RULES`)

Шаблон уже содержит пустой слот в `.claude/agents/backend-specialist.md`; заполнить его:

```markdown
<!-- HELPERS:CUSTOM START: STACK_RULES -->

- Все входящие API-запросы валидируются через Zod-схему в `src/app/api/...`.

<!-- HELPERS:CUSTOM END: STACK_RULES -->
```

Тело переживает `helpers sync` и `helpers sync --update-stack` байт-в-байт, а его правка не даёт drift в `status --strict`. Если удалить строку END, `helpers sync` завершится с exit 1 и не запишет ни одного файла, а `helpers doctor --stack` покажет `[ERROR] Unbalanced slot` и вернёт 2.

---

## 5. CI

```bash
helpers status --strict           # 2 = файловый drift или стековый HIGH (только при привязках)
helpers doctor --stack --json     # причина стекового exit 2
```

MEDIUM-находки (`version_conflict`, `ambiguous_stack`, `missing_skill_catalog`, `skill_budget`) сборку не блокируют.

---

## 6. Отключение

```json
{ "schema": 1, "enabled": false }
```

С таким `helpers-stack.json` привязки не применяются и не проверяются, а следующий `helpers sync` возвращает апстримные строки.
