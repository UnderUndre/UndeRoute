# Business Plan Waiver: Stack-Aware Agent Fleet Synchronization

**Feature**: `003-stack-aware-agents`
**Date**: 2026-10-11
**Basis**: Constitution v1.7.0, Principle VII-B.5
**Status**: Active

---

## Reason

Фича меняет только внутренний инструмент разработки: CLI `underoute-clai` (bin `helpers`, MIT) и шаблон `.claude/`. Ни одного коммерческого триггера из VII-B.2 она не затрагивает:

| Триггер VII-B.2             | Изменение                                     |
| --------------------------- | --------------------------------------------- |
| ICP                         | нет                                           |
| Цена                        | нет                                           |
| Упаковка / SKU              | нет: CLI бесплатный и ни в один SKU не входит |
| Focus gates                 | нет                                           |
| Legal / payment rails       | нет                                           |
| Юнит-экономика (CAC, маржа) | нет                                           |

Бизнес-план продукта UndeRoute (v3.0) ведётся вне этого репозитория: `undreplans/docs/projects/underoute/business-plan.md`. Ни SKU MVP-1…MVP-4, ни Hard Law этого плана CLI и шаблон не упоминают, поэтому commercial drift для фичи проверять не с чем.

## Scope

Waiver действует только для `003-stack-aware-agents` в границах spec rev 2.

## Withdrawal

Waiver отзывается, и до `/speckit.implement` нужен `/speckit.business-plan` UPDATE, если:

- стековая привязка или матрица становятся частью платного предложения, тарифа или маркетплейса;
- появляется сетевой реестр матриц или телеметрия использования;
- меняется лицензия CLI или шаблона.
