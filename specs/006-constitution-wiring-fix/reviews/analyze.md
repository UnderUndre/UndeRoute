# SpecKit Analyze: 006-constitution-wiring-fix

**Reviewer**: analyze (ZCode self-consistency, по контракту `.claude/commands/speckit.analyze.md`)
**Reviewed at**: 2026-11-16T00:20:00+03:00
**Commit**: 9dddd75c02 (review fix-pass, post antigravity v1 review)
**Artifacts**: spec.md, plan.md, research.md, tasks.md, requirements-audit.md, qa/preliminary-rtm.md, qa/waiver.md, business-plan-waiver.md, reviews/analyze.md (v1), reviews/antigravity.md, .specify/memory/constitution.md

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
| --- | --- | --- | --- | --- | --- |
| F1 | Agent Routing / Execution (external, antigravity v1) | RESOLVED | plan.md §Technical Context + ADR-009, tasks.md T017 | `npx clai-helpers sync/status` неисполнимы (нет пакета в root devDeps, sync.ts:352/status.ts:49 требуют helpers-lock) и full regen создал бы `.gemini/` вопреки FR-013 | Применено: T017 → `node packages/cli/bin/helpers.mjs regen --targets copilot` + `git diff --exit-code .github/`; EMFILE fallback задокументирован |
| F2 | Cross-Document Consistency (external, antigravity v1) | RESOLVED | spec FR-002(d)/FR-005/FR-006, tasks T006/T007/T010/T011, ADR-007 | Неполная single-source миграция: 4×CLAUDE.md refs (dispatch.md :2/:20/:63/:70, constitution :97, intent-hint.sh :10/:112) + битые /brainstorm,/bump в хуке :63/:95 | Применено: FR-002(d) расширен на :112/:63/:95; FR-006 на 4×dispatch refs; amend-бандл = 6 правок (VIII.1 :97 добавлен в T002/T011); направление правды перевёрнуто (таблица = источник) |
| F3 | Enforcement Logic (external, antigravity v1) | RESOLVED | spec FR-001, tasks T003 | Слепая вставка XII в analyze сломала бы самоприменимость: §2 не грузил qa-артефакты, waiver-спеки без rtm-matrix дали бы ложный CRITICAL, шаблонные `- [x]` (tasks.md:146-150) попали бы под XII.4 | Применено: FR-001/T003 — §2 Load Artifacts + qa-артефакты, waiver-fallback (покрытие по preliminary-rtm), XII.4 поиск строго `- \[[xX]\] T\d+` исключая Self-Validation Checklist |
| F4 | Logical Consistency (external, antigravity v1) | RESOLVED | plan.md §Structure, tasks T012/T016 | Фантомная §6 SpecKit Integration в specs/main/architecture.md (реально 46 строк, ## 1..## 5, таблица в ## 4 Stage map) | Применено: T016 → ## 4. Stage map; T012 чинит speckit.plan.md:103-105; ADR-009-смежное убрано из plan |
| F5 | Constitution IX (external, antigravity v1) | RESOLVED (process) | tasks T019 | Planning-суита закоммичена в main (bb2fbb1bae) до 2×review; T019-гейт сравнивал с main напрямую | Применено: T019 переведён на `<base-sha>...HEAD` с фиксацией base-sha в verification/baseline.md; lineage-решение (merge после 2×PASS) — за владельцем |
| F6 | Dangling Code Reference (external, antigravity v1) | RESOLVED (documented) | spec FR-010, research D2, plan ADR-008 | Удаление dialog-capture.mjs переводит `helpers dialog doctor` (dialog.ts:106-110) в fail (exit 1) | Применено: осознанный побочный эффект задокументирован в FR-010/D2/ADR-008; вычистка packages/ вне скоупа NFR-003, кандидат в будущую спеку |
| F7 | Hidden Assumptions (external, antigravity v1) | RESOLVED | spec FR-007, research D11, tasks T006/T018 | base-green/sweep-reds существуют как апстрим-шаблоны в config/quality/skill-templates/ (v1-формулировка «не существует в репо» была неточной); check:fabricated-docs не был в AC | Применено: формулировка уточнена (отсутствие по активным путям, шаблоны = инвентарь); `npm run check:fabricated-docs` exit 0 в AC T006/T018 |
| F8 | Precision nits (external, antigravity v1) | RESOLVED | spec FR-002(d), tasks T007/T015, plan ADR-005 | intent-hint.sh комментарий на :10 (не :8); grep XV не анкорирован; ADR-005 приписывал analyze скрипту | Применено: :10 везде; `grep -E "^### (Principle )?XV\.?"` в T015/rtm; ADR-005: analyze остаётся manual (VII не резервирует) |
| M1 | Drift-risk (analyze v1) | MEDIUM (mitigated) | tasks T018, spec FR-002 | Таблица Intent Routing (AGENTS.md) vs regex-матчи intent-hint.sh и команды dispatch.md: автодрифт-чека нет | Частичная митигация принята: T018 проверяет существование всех /команд из таблицы (antigravity alternative #1). Полная автоматизация (сверка regex-веток хука с таблицей) остаётся /learn-кандидатом, не раздувать 006 |
| L1 | Lineage note | LOW | main bb2fbb1bae vs branch 9dddd75c02 | main содержит v1-суиту (prettier-форматирование, CRLF), ветка — канонический пайплайн с тегами; при merge конфликты resolve в сторону ветки для specs/006 | Зафиксировать в merge-коммите: specs/006-... = take branch side |

## Coverage Summary

| Requirement Key | Has Task? | Task IDs | Notes |
| --- | --- | --- | --- |
| FR-001 (analyze XII: load qa-артефакты + RTM waiver-fallback + XII.4 regex-скоуп) | ✅ | T003 | F3-уточнения вшиты |
| FR-002 (routing canon: AGENTS.md source + хук :10/:63/:95/:112) | ✅ | T006, T007 | F2-расширение |
| FR-003 (snapshot stage-list) | ✅ | T004, T005 | без изменений (F8.3 касается только ADR-005 текста) |
| FR-004 (IX text fix) | ✅ | T011 | amend-бандл |
| FR-005 (v1.9.1: 6 правок вкл. VIII.1 :97) | ✅ | T011 | F2-расширение |
| FR-006 (dispatch: 3 команды + 4×CLAUDE.md refs) | ✅ | T010 | F2-расширение |
| FR-007 (base-green/sweep-reds/_tasks, F7-precision) | ✅ | T008, T009 | формулировка уточнена |
| FR-008 (Principle XIV + plan/qa-signoff wiring + plan:103-105 fix) | ✅ | T011, T012 | F4-расширение |
| FR-009 (knowledge bootstrap) | ✅ | T013 | — |
| FR-010 (dialog-capture delete + F6 side effect) | ✅ | T014 | задокументировано |
| FR-011 (Principle V dual-role) | ✅ | T011 | — |
| FR-012 (ops via чеклист; XV отсутствует, анкорированный grep) | ✅ | T011, T015 | F8.2 |
| FR-013 (.gemini N/A; T017 не генерирует gemini-таргет) | ✅ | T011, T015, T017 | ADR-009 |
| NFR-001 (budgets 60/50) | ✅ | T006, T011, T018 | — |
| NFR-002 (verifiability) | ✅ | requirements-audit.md | 18/18 |
| NFR-003 (no runtime surface; base-sha gate) | ✅ | T019 | F5 |
| NFR-004 (backward compat) | ✅ | T004, T005, T018 | — |
| NFR-005 (single source; полный охват 4 файлов) | ✅ | T006, T007, T010, T011, T018 | F2 |

## Constitution Alignment Issues

- Пусто. Самоссылочность (analyze v1 note) сохраняется корректно: T003 чинит analyze до того, как будущие спеки будут им проверяться; для 006 гейт использует preliminary-rtm как RTM-эквивалент (теперь это ЗАКРЕПЛЕНО в самом FR-001 waiver-fallback — гейт больше не врёт).
- Governance §2: amend-бандл 6 правок атомарен (T011+T012, один коммит) — расширение F2 не нарушило атомарность.
- Principle I: T017 теперь исполним (regen без lockfile, --targets copilot, FR-013 инвариант сохранён).

## Commercial / Business Plan Alignment

- Plan files loaded: docs/business-plan-pointer.md (external canon v3.1) + business-plan-waiver.md (VII-B.5 chore-only).
- Findings: no commercial drift detected (antigravity подтвердил: "Drift: none").

## Unmapped Tasks

- Пусто: 19 задач замаплены; новые элементы (fabricated-docs, M1-митигация, base-sha) вошли в существующие T006/T018/T019 без изменения DAG (зависимости T001→…, fan-in/fan-out валидны, циклов нет).

## Metrics

- Total Requirements: 18 (13 FR + 5 NFR)
- Total Tasks: 19
- Coverage %: 100%
- Ambiguity count: 0
- Duplication count: 0
- CRITICAL count: 0
- HIGH count: 0
- MEDIUM count: 1 (M1, mitigated)
- LOW count: 1 (L1)
- External review findings: 8/8 RESOLVED (4H+3M+1L, antigravity v1)

## VERDICT

```yaml
verdict: PASS
override_reason: null
reviewer: analyze
reviewed_at: 2026-11-16T00:20:00+03:00
commit: 9dddd75c02
critical_count: 0
high_count: 0
medium_count: 1
low_count: 1
```

**Gate status (Principle VI)**: analyze v2 PASS. External reviews: antigravity v1 = HIGH (на v1-артефактах, все findings устранены fix-pass `9dddd75c02`) — для implement требуется ≥2 external PASS на ТЕКУЩЕМ состоянии: (1) ре-ревью antigravity на `9dddd75c02` (ожидаемо PASS: все findings закрыты), (2) второй внешний ревьюер (Codex/Gemini/Copilot/Claude independent). Без двух PASS implement блокирован; bypass только через `--override-gate "<reason>"` с логом.
