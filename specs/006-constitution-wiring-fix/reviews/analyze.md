# SpecKit Analyze: 006-constitution-wiring-fix

**Reviewer**: analyze (ZCode self-consistency, по контракту `.claude/commands/speckit.analyze.md`)
**Reviewed at**: 2026-11-15T22:05:00+03:00
**Commit**: 69e3b1d379 (tasks stage)
**Artifacts**: spec.md, plan.md, research.md, tasks.md, requirements-audit.md, qa/preliminary-rtm.md, business-plan-waiver.md, qa/waiver.md

## Findings

| ID  | Category                 | Severity | Location(s)                        | Summary                                                                                                                                                                      | Recommendation                                                                                                                                                                                |
| --- | ------------------------ | -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | Consistency (дрифт-риск) | MEDIUM   | tasks.md:T006/T007, spec.md FR-002 | Таблица Intent Routing (AGENTS.md, источник после T007) и regex-матчи intent-hint.sh не имеют автоматического drift-чекa; рассинхрон возможен при будущих добавках маршрутов | В этой спеке: T007 фиксирует направление правды (комментарий хука → AGENTS.md). Автоматизацию (расширение `clai-helpers status` или lint) вынести в кандидат-заметку /learn, не раздувать 006 |
| L1  | Underspecification       | LOW      | spec.md FR-008, tasks.md T012      | «Применимость определяет план» — оценочное суждение per-feature                                                                                                              | Приемлемо by design (чтобы не гонять 9 чеклистов на каждую chore); T012 предписывает шаг перечня в plan/qa-signoff командах                                                                   |
| A1  | Duplication              | LOW      | tasks.md T015 vs T018              | AC FR-012/FR-013 проверяются дважды (локально в US3 и в финальном чек-листе)                                                                                                 | Вредная избыточность отсутствует: локальная проверка держит evidence в US3, T018 консолидирует; оставить                                                                                      |
| G1  | Agent Routing            | LOW      | tasks.md Notes, plan.md ADR-005    | Stage-теги requirements-audit/analyze до T004/T005 ставятся вручную (скрипт не знает стадий — сама находка №11)                                                              | Осознанное, прецедентированное (004) отклонение; после T004/T005 скрипт принимает обязанности. В graph не является зависимостью                                                               |

Severity-порогов CRITICAL/HIGH нет.

## Coverage Summary

| Requirement Key                            | Has Task? | Task IDs              | Notes                                                             |
| ------------------------------------------ | --------- | --------------------- | ----------------------------------------------------------------- |
| FR-001 (analyze XII RTM+evidence)          | ✅        | T003                  | цитаты §XII verbatim, CRITICAL-север                              |
| FR-002 (Intent Routing canon + precedence) | ✅        | T006, T007            | (a+b+c) / (d) раздельно; бюджет ≤60 строк в AC                    |
| FR-003 (snapshot stage-list)               | ✅        | T004, T005            | bash и ps1 раздельно; негативные тесты старых имён в AC (NFR-004) |
| FR-004 (IX text fix)                       | ✅        | T011                  | в amend-бандле                                                    |
| FR-005 (v1.9.1 hooks-note)                 | ✅        | T011                  | формулировка «6 хуков зарегистрированы» (согласовано с FR-010)    |
| FR-006 (dispatch refs)                     | ✅        | T010                  | loop grep 0 dangling                                              |
| FR-007 (base-green / sweep-reds / _tasks)  | ✅        | T008, T009            | (a+b) / (c) раздельно; AGENTS.md `_*`-канон защищён (ADR-006)     |
| FR-008 (Principle XIV)                     | ✅        | T011, T012            | текст + dependent commands wiring                                 |
| FR-009 (knowledge bootstrap)               | ✅        | T013                  | INDEX.md status: empty                                            |
| FR-010 (dialog-capture delete)             | ✅        | T014                  | settings.json нетронут (git diff в AC)                            |
| FR-011 (Principle V dual-role)             | ✅        | T011                  | grep «dual role»                                                  |
| FR-012 (ops via чеклист)                   | ✅        | T011, T015            | XV не добавляется; верификация T015                               |
| FR-013 (.gemini N/A)                       | ✅        | T011, T015            | пометка в Principle I + верификация                               |
| NFR-001 (token budget 60/50)               | ✅        | T006, T011, T018      | wc -l дельта в чек-листе                                          |
| NFR-002 (verifiability)                    | ✅        | requirements-audit.md | 18/18 исполняемых AC (PASS)                                       |
| NFR-003 (no runtime surface)               | ✅        | T019                  | git diff path-фильтр = пусто                                      |
| NFR-004 (backward compat)                  | ✅        | T004, T005, T018      | негативные exit-тесты 6 старых имён                               |
| NFR-005 (single source routing)            | ✅        | T006, T018            | секция = 1 в AGENTS.md, 0 в CLAUDE.md                             |

## Constitution Alignment Issues

- Пусто. Самоссылочное замечание (не нарушение): конституция XII требует, чтобы analyze проверял RTM/XII.4 — текущий analyze.md этого не умеет, и ЧИНИТСЯ задачей T003 этой же спеки. Данный прогон использует RTM-эквивалент (qa/preliminary-rtm.md, 18/18) как карту покрытия до высадки T003.
- Governance §2 соблюдён по построению: constitution.md редактируется ровно одной задачей T011, коммит атомарен с T012 (ADR-001).
- Principle I: transpile-гигиена зашита задачей T017 (`clai-helpers sync` + `status --strict` после правок commands).

## Commercial / Business Plan Alignment

- Plan files loaded: docs/business-plan-pointer.md (external canon v3.1, undreplans).
- Focus/hard laws checked: N/A — `business-plan-waiver.md` присутствует (VII-B.5, chore-only), категория H пропускается по правилу команды.
- Findings: no commercial drift detected (ноль коммерческой поверхности: NFR-003).

## Unmapped Tasks

- Пусто: все 19 задач замаплены на requirements (T001/T002 — evidence-инфраструктура Setup, T016 — план-канон living-spec row, T017 — Principle I transpile gate, T018/T019 — XII.4/NFR-003 гейты).

## Metrics

- Total Requirements: 18 (13 FR + 5 NFR)
- Total Tasks: 19
- Coverage % (requirements with ≥1 task): 100%
- Ambiguity count: 0
- Duplication count: 0
- CRITICAL count: 0
- HIGH count: 0
- MEDIUM count: 1 (M1)
- LOW count: 3 (L1, A1, G1)

## VERDICT

```yaml
verdict: PASS
override_reason: null
reviewer: analyze
reviewed_at: 2026-11-15T22:05:00+03:00
commit: 69e3b1d379
critical_count: 0
high_count: 0
medium_count: 1
low_count: 3
```

**Next**: Ready for `/speckit.review` from external AIs (Codex Desktop, Antigravity, Gemini CLI, Copilot, Claude independent session). Need ≥2 PASS verdicts in `specs/006-constitution-wiring-fix/reviews/<provider>.md` before `/speckit.implement` per constitution Principle VI (NON-NEGOTIABLE). M1 — кандидатов в remediation не требует; внешним ревьюерам предложить проверить справедливость M1 и полноту amend-манифеста T002.
